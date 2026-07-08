export enum PullingRefreshStatus {
    IDLE,
    PULLING,
    PULLINGGO,
    PULLINGBACK,
    LOADING,
    BACKUP,
}

export const iOSpringConfig = {
    velocity: 0,
    mass: 1,
    damping: 27,
    stiffness: 300,
    overshootClamping: true,
    // duration: 600,
};

export const PULLDOWN_OFFSET = 1;
export const PULLUP_OFFSET = 50;

// true -> dev
export const LOG_FLAG = false;

export const FnNull = () => {
    /*  */
};
