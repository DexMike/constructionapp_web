/// <reference types="heremaps" />
import React from 'react';
import { HEREMapContext } from './utils/map-context';
export interface HEREMapProps extends H.Map.Options {
    appId: string;
    appCode: string;
    animateCenter?: boolean;
    animateZoom?: boolean;
    hidpi?: boolean;
    interactive?: boolean;
    secure?: boolean;
    setLayer?: {
        layer: 'map' | 'traffic' | 'panorama' | 'transit' | 'xbase' | 'base' | 'labels';
        mapType: 'normal' | 'satelite' | 'terrain';
    };
    originmarkersGroup?: {}
}
export interface OwnState {
}
export declare class HEREMap extends React.Component<HEREMapProps, HEREMapContext> {
    private debouncedResizeMap;
    constructor(props: HEREMapProps);
    componentDidMount(): void;
    componentDidUpdate(prevProps: HEREMapProps): void;
    componentWillUnmount(): void;
    createMap: () => HEREMapContext;
    getElement(): Element | Text | null;
    setCenter(point: H.geo.IPoint): void;
    setZoom(zoom: number): void;
    private resizeMap;
    render(): JSX.Element;
}
export default HEREMap;
