import React, { memo, type PropsWithChildren, useCallback } from 'react';
import type { LayoutChangeEvent, NativeScrollEvent, ViewProps } from 'react-native';
import { StyleSheet, View } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, { Extrapolate, interpolate, runOnJS, runOnUI, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue } from 'react-native-reanimated';
import { FnNull, PullingRefreshStatus, LOG_FLAG, PULLDOWN_OFFSET, PULLUP_OFFSET } from './constants';
import { PullRefreshContext } from './context';
import { PulldownLoading, PullupLoading } from './DefaultLoading';
import { actuallyMove, checkChildren, withAnimation } from './utils';


export type RefreshWrapperProps = ViewProps & {
    pulldownEnabled?: boolean;
    pullupEnabled?: boolean;
    pulldownHeight?: number;
    pullupHeight?: number;
    pulldownLoading?: React.ReactNode;
    pullupLoading?: React.ReactNode;
    containerFactor?: number;
    pullingFactor?: number;
    onPulldownRefresh?: () => void | Promise<unknown>;
    onPullupRefresh?: () => void | Promise<unknown>;
}


const RefreshWrapper: React.FC<PropsWithChildren<RefreshWrapperProps>> = ({
    pulldownEnabled = true,
    pullupEnabled = true,
    pulldownHeight = 120,
    pullupHeight = 120,
    pulldownLoading = <PulldownLoading />,
    pullupLoading = <PullupLoading />,
    containerFactor = 0.5,
    pullingFactor = 2.2,
    onPulldownRefresh = FnNull,
    onPullupRefresh = FnNull,
    style,
    children,
}) => {
    // custom
    const pulldownState = useSharedValue<PullingRefreshStatus>(PullingRefreshStatus.IDLE);
    const pullupState = useSharedValue<PullingRefreshStatus>(PullingRefreshStatus.IDLE);
    const containerY = useSharedValue(0);
    const contentY = useSharedValue(0);
    const scrollerOffsetY = useSharedValue(0);
    const panTranslateY = useSharedValue(0);
    const recordValue = useSharedValue(0);
    const lockIDLE = useSharedValue(0);

    const onPulldownLoading = async () => {
        if (!pulldownEnabled) {
            return;
        }
        // await void 在运行时等价于立即 resolve，安全无害
        try {
            // @ts-ignore
            await onPulldownRefresh();
        } catch {
            // 静默处理
        }

        runOnUI(() => {
            // noinspection BadExpressionStatementJS
            'worklet';

            pulldownState.value = PullingRefreshStatus.BACKUP;
            panTranslateY.value = withAnimation(0, () => {
                pulldownState.value = PullingRefreshStatus.IDLE;
            });
        })();
    };

    const onPullupLoading = async () => {
        if (!pullupEnabled) {
            return;
        }
        // await void 在运行时等价于立即 resolve，安全无害
        try {
            // @ts-ignore
            await onPullupRefresh();
        } catch {
            // 静默处理
        }

        runOnUI(() => {
            // noinspection BadExpressionStatementJS
            'worklet';

            pullupState.value = PullingRefreshStatus.BACKUP;
            panTranslateY.value = withAnimation(0, () => {
                pullupState.value = PullingRefreshStatus.IDLE;
            });
        })();
    };

    const native = Gesture.Native();
    // FIXME: 响应有一个延时偏差，本来就很难搞呀
    const panGesture = Gesture.Pan()
        .onStart(event => {
            // noinspection BadExpressionStatementJS
            'worklet';

            // FIXME: Check Pull Status.
            if (pulldownState.value >= PullingRefreshStatus.PULLINGBACK || pullupState.value >= PullingRefreshStatus.PULLINGBACK) {
                return;
            }
            if (scrollerOffsetY.value <= PULLDOWN_OFFSET && pulldownState.value === PullingRefreshStatus.IDLE && event.translationY > 0) {
                pulldownState.value = PullingRefreshStatus.PULLING;
                recordValue.value = event.translationY;
            }
            if (scrollerOffsetY.value >= contentY.value - containerY.value - PULLUP_OFFSET && pullupState.value === PullingRefreshStatus.IDLE && event.translationY < 0) {
                pullupState.value = PullingRefreshStatus.PULLING;
                recordValue.value = event.translationY;
            }
            // eslint-disable-next-line no-console, @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition
            LOG_FLAG && console.log('onStart', pulldownState.value, pullupState.value);
        })
        .onChange(event => {
            // noinspection BadExpressionStatementJS
            'worklet';
            // when loading do nothing.
            if (pulldownState.value >= PullingRefreshStatus.PULLINGBACK || pullupState.value >= PullingRefreshStatus.PULLINGBACK) {
                return;
            }

            // pull down
            if (event.translationY > 0) {
                if (pullupState.value !== PullingRefreshStatus.IDLE) {
                    // FIXME: The delay released here will trigger the freezing of the bottom scroll,
                    // which is more obvious on Android than on iOS.
                    lockIDLE.value = 1;
                    pullupState.value = PullingRefreshStatus.IDLE;
                }

                if (scrollerOffsetY.value <= PULLDOWN_OFFSET) {
                    const newStatus = actuallyMove(event.translationY, containerY.value) > pulldownHeight * pullingFactor ? PullingRefreshStatus.PULLINGGO : PullingRefreshStatus.PULLING;

                    if (newStatus !== pulldownState.value) {
                        if (pulldownState.value === PullingRefreshStatus.IDLE) {
                            recordValue.value = event.translationY;
                        }

                        pulldownState.value = newStatus;
                    }

                    const move = event.translationY - recordValue.value;

                    if (move < 0) {
                        pulldownState.value = PullingRefreshStatus.IDLE;
                    } else {
                        panTranslateY.value = move;
                    }
                }
            }

            // FIXME: release switch has an issue.
            if (event.translationY < 0) {
                // up
                if (pulldownState.value !== PullingRefreshStatus.IDLE) {
                    lockIDLE.value = 1;
                    pulldownState.value = PullingRefreshStatus.IDLE;
                }

                // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition
                LOG_FLAG &&
                    // eslint-disable-next-line no-console
                    console.log('onChangeBottom', scrollerOffsetY.value >= contentY.value - containerY.value - PULLUP_OFFSET);

                if (scrollerOffsetY.value >= contentY.value - containerY.value - PULLUP_OFFSET) {
                    const newStatus = actuallyMove(-event.translationY, containerY.value) > pullupHeight * pullingFactor ? PullingRefreshStatus.PULLINGGO : PullingRefreshStatus.PULLING;

                    if (newStatus !== pullupState.value) {
                        // TODO: 个人感觉是这个值记录得有问题
                        if (pullupState.value === PullingRefreshStatus.IDLE) {
                            recordValue.value = event.translationY;
                        }

                        pullupState.value = newStatus;
                    }

                    // noinspection UnnecessaryLocalVariableJS
                    const move = event.translationY - recordValue.value;

                    // if (move > 0) {
                    //   pullupState.value = PullingRefreshStatus.IDLE;
                    // } else {
                    panTranslateY.value = move;
                    // }
                }
            }

            if (lockIDLE.value) {
                lockIDLE.value = 0;
            }

            // FIXME: when fast move, need recheck it

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition
            LOG_FLAG &&
                // eslint-disable-next-line no-console
                console.log('onChange-value', scrollerOffsetY.value, contentY.value - containerY.value, contentY.value, containerY.value, scrollerOffsetY.value - (contentY.value - containerY.value));

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition
            LOG_FLAG &&
                // eslint-disable-next-line no-console
                console.log('onChange', pulldownState.value, pullupState.value);
        })
        .onEnd(() => {
            // noinspection BadExpressionStatementJS
            'worklet';
            if (pulldownState.value >= PullingRefreshStatus.PULLINGBACK || pullupState.value >= PullingRefreshStatus.PULLINGBACK) {
                return;
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition
            LOG_FLAG &&
                // eslint-disable-next-line no-console
                console.log(scrollerOffsetY.value >= contentY.value - containerY.value - PULLUP_OFFSET);

            if (pulldownEnabled && scrollerOffsetY.value <= PULLDOWN_OFFSET) {
                if (pulldownState.value !== PullingRefreshStatus.IDLE) {
                    pulldownState.value = panTranslateY.value >= pulldownHeight * pullingFactor ? PullingRefreshStatus.PULLINGBACK : PullingRefreshStatus.BACKUP;

                    if (pulldownState.value === PullingRefreshStatus.BACKUP) {
                        panTranslateY.value = withAnimation(0, () => {
                            pulldownState.value = PullingRefreshStatus.IDLE;
                        });
                    }

                    if (pulldownState.value === PullingRefreshStatus.PULLINGBACK) {
                        panTranslateY.value = withAnimation(pulldownHeight, () => {
                            pulldownState.value = PullingRefreshStatus.LOADING;
                            runOnJS(onPulldownLoading)();
                        });
                    }
                }
            }

            if (pullupEnabled && scrollerOffsetY.value >= contentY.value - containerY.value - PULLUP_OFFSET) {
                if (pullupState.value !== PullingRefreshStatus.IDLE) {
                    pullupState.value = -panTranslateY.value >= pullupHeight * pullingFactor ? PullingRefreshStatus.PULLINGBACK : PullingRefreshStatus.BACKUP;

                    if (pullupState.value === PullingRefreshStatus.BACKUP) {
                        panTranslateY.value = withAnimation(0, () => {
                            pullupState.value = PullingRefreshStatus.IDLE;
                        });
                    }

                    if (pullupState.value === PullingRefreshStatus.PULLINGBACK) {
                        panTranslateY.value = withAnimation(-pullupHeight, () => {
                            pullupState.value = PullingRefreshStatus.LOADING;
                            runOnJS(onPullupLoading)();
                        });
                    }
                }
            }

            if (scrollerOffsetY.value >= PULLDOWN_OFFSET && scrollerOffsetY.value <= contentY.value - containerY.value - PULLUP_OFFSET) {
                if (pulldownEnabled && pulldownState.value !== PullingRefreshStatus.IDLE) {
                    pulldownState.value = PullingRefreshStatus.IDLE;
                }
                if (pullupEnabled && pullupState.value !== PullingRefreshStatus.IDLE) {
                    pullupState.value = PullingRefreshStatus.IDLE;
                }
            }

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition
            LOG_FLAG &&
                // eslint-disable-next-line no-console
                console.log('onEnd-value', scrollerOffsetY.value, contentY.value - containerY.value, contentY.value, containerY.value, scrollerOffsetY.value - (contentY.value - containerY.value));

            // eslint-disable-next-line @typescript-eslint/no-unused-expressions, @typescript-eslint/no-unnecessary-condition, no-console
            LOG_FLAG && console.log('onEnd', pulldownState.value, pullupState.value);
        });

    const contentAnimation = useAnimatedStyle(() => {
        const isPulldown = pulldownState.value !== PullingRefreshStatus.IDLE;
        let input = [0, pulldownHeight, containerY.value];
        let output = [0, pulldownHeight, containerY.value * containerFactor];

        if (!isPulldown) {
            input = [-containerY.value, -pullupHeight, 0];
            output = [-containerY.value * containerFactor, -pullupHeight, 0];
        }

        return {
            /**
             *    FIXME: #issue 👀
             *           Pullup to bounce back failed during the quick move down to up
             *           at the bottom on ios and android simulator.
             *           However, it works fine on the real device.
             *           Maybe the simulator cant tracking gestures by mouse normally.
             *  */
            overflowY:
                /* for web */
                pullupState.value !== PullingRefreshStatus.IDLE || pulldownState.value !== PullingRefreshStatus.IDLE || lockIDLE.value ? 'hidden' : 'auto',
            pointerEvents: pullupState.value !== PullingRefreshStatus.IDLE || pulldownState.value !== PullingRefreshStatus.IDLE || lockIDLE.value ? 'none' : 'auto',
            transform: [
                {
                    translateY: interpolate(panTranslateY.value, input, output, Extrapolate.CLAMP),
                },
            ],
        };
    });

    const pulldownLoadingStyle = useAnimatedStyle(() => {
        const isHidden = pulldownState.value === PullingRefreshStatus.IDLE && panTranslateY.value === 0;
        return {
            opacity: isHidden ? 0 : 1,
        };
    });

    const onScroll = useAnimatedScrollHandler((event: NativeScrollEvent) => {
        // FIXME: 下拉刷新是一定依赖这个数据值的，不然你无法处理的
        scrollerOffsetY.value = event.contentOffset.y;
        // LogFlag && console.log('onScroll', event.contentOffset);

        const _children = children as React.ReactElement;
        // @ts-ignore
        if (_children.props?.onScroll) {
            // @ts-ignore
            runOnJS(_children.props.onScroll)(event);
        }
    });

    const onLayout = useCallback(
        (event: LayoutChangeEvent) => {
            containerY.value = event.nativeEvent.layout.height;
        },
        [containerY]
    );

    const onContentSizeChange = useCallback(
        (_width: number, height: number) => {
            contentY.value = height;

            // @ts-ignore
            if (children.onContentSizeChange) {
                // @ts-ignore
                children.onContentSizeChange(event);
            }
        },
        [contentY, children]
    );
    const childStyle = [
        StyleSheet.absoluteFill,
        styles.zTop,
        // @ts-ignore
        children?.props?.style,
        contentAnimation,
    ];

    return (
        <PullRefreshContext.Provider
            value={{
                pulldownState,
                pullupState,
                panTranslateY,
                scrollerOffsetY,
                contentY,
                containerY,
                pulldownHeight,
                pullupHeight,
                pullingFactor,
                containerFactor,
            }}
        >
            <View style={[styles.flex, styles.overhidden, style]}>
                {pulldownEnabled && (
                    <Animated.View style={[styles.pulldownContainer, pulldownLoadingStyle]}>
                        {pulldownLoading}
                    </Animated.View>
                )}
                <GestureDetector gesture={Gesture.Simultaneous(panGesture, native)}>
                    {React.cloneElement(checkChildren(children as React.ReactElement), {
                        // @ts-ignore
                        onContentSizeChange,
                        onScroll,
                        bounces: false,
                        // @ts-ignore
                        style: childStyle,
                        scrollEventThrottle: 16,
                        onLayout,
                    })}
                </GestureDetector>
                {pullupEnabled && (
                    <Animated.View style={[styles.pullupContainer, { height: pullupHeight }]}>
                        {pullupLoading}
                    </Animated.View>
                )}
            </View>
        </PullRefreshContext.Provider>
    );
};


const styles = StyleSheet.create({
    flex: {
        flex: 1,
    },
    zTop: {
        zIndex: 3,
    },
    overhidden: {
        overflow: 'hidden',
    },
    pullupContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
    },
    pulldownContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});


export const PullRefresh = memo(RefreshWrapper);
