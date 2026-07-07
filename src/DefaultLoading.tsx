import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { PullingRefreshStatus } from './constants';
import { useOnPulldownState, useOnPullupState, usePulldownLoadingAnimation, usePullupLoadingAnimation } from './hooks'; // note: react-native-reanimated only suppot style-animation

// note: react-native-reanimated only suppot style-animation

interface LoadingProps {
    animating?: boolean;
}

export const Loading: React.FC<LoadingProps> = ({ animating }) => (
    <View style={styles.loadingInner}>
        <ActivityIndicator animating={animating} color="#782aeb" />
        <Text style={styles.ml8}>Loading</Text>
    </View>
);

export const PulldownLoading = () => {
    const [animating, setAnimating] = useState<boolean>(false);
    useOnPulldownState((state: PullingRefreshStatus) => {
        if ([PullingRefreshStatus.LOADING, PullingRefreshStatus.PULLINGGO, PullingRefreshStatus.PULLINGBACK].includes(state)) {
            setAnimating(true);
        } else {
            setAnimating(false);
        }
    });

    const animatedStyle = usePulldownLoadingAnimation();

    return (
        <Animated.View style={[styles.loadingDownContainer, animatedStyle]}>
            <Loading animating={animating} />
        </Animated.View>
    );
};

export const PullupLoading = () => {
    const [animating, setAnimating] = useState<boolean>(false);
    useOnPullupState((state: PullingRefreshStatus) => {
        if ([PullingRefreshStatus.LOADING, PullingRefreshStatus.PULLINGGO, PullingRefreshStatus.PULLINGBACK].includes(state)) {
            setAnimating(true);
        } else {
            setAnimating(false);
        }
    });

    const animatedStyle = usePullupLoadingAnimation();

    return (
        <Animated.View style={[styles.loadingUpContainer, animatedStyle]}>
            <Loading animating={animating} />
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    loadingDownContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    loadingUpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
    },
    ml8: {
        marginLeft: 8,
    },
    loadingInner: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
