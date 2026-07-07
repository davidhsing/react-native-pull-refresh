import { useContext } from 'react';
import { Extrapolate, interpolate, runOnJS, useAnimatedReaction, useAnimatedStyle } from 'react-native-reanimated';
import { type PullingRefreshStatus } from './constants';
import { PullRefreshContext } from './context';


export const usePullRefreshValue = () => useContext(PullRefreshContext);


export const useOnPulldownState = (onChange: (value: PullingRefreshStatus) => void) => {
    const ctx = usePullRefreshValue();

    useAnimatedReaction(
        () => ctx.pulldownState.value,
        (current, prev) => {
            if (current !== prev) {
                runOnJS(onChange)(current);
            }
        },
        []
    );
};


export const usePulldownLoadingAnimation = () => {
    const ctx = usePullRefreshValue();

    const { pulldownHeight, panTranslateY } = ctx;

    return useAnimatedStyle(() => ({
        height: pulldownHeight,
        opacity: interpolate(panTranslateY.value, [0, pulldownHeight], [0, 1]),
        transform: [
            {
                translateY: interpolate(panTranslateY.value, [0, pulldownHeight], [-pulldownHeight, 0], Extrapolate.CLAMP),
            },
        ],
    }));
};


export const useOnPullupState = (onChange: (value: PullingRefreshStatus) => void) => {
    const ctx = usePullRefreshValue();

    useAnimatedReaction(
        () => ctx.pullupState.value,
        (current, prev) => {
            if (current !== prev) {
                runOnJS(onChange)(current);
            }
        },
        []
    );
};

export const usePullupLoadingAnimation = () => {
    const ctx = usePullRefreshValue();

    const { pullupHeight, panTranslateY } = ctx;

    return useAnimatedStyle(() => ({
        height: pullupHeight,
        opacity: interpolate(-panTranslateY.value, [0, pullupHeight], [0, 1]),
        transform: [
            {
                translateY: interpolate(-panTranslateY.value, [0, pullupHeight], [pullupHeight, 0], Extrapolate.CLAMP),
            },
        ],
    }));
};
