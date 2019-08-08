/// <reference types="heremaps" />
import React from 'react';
import { HEREMapContext } from './utils/map-context';
export interface CircleProps extends H.map.Circle.Options, H.geo.IPoint {
    strokeColor?: string;
    lineWidth?: number;
    fillColor?: string;
    radius: number;
}
export declare class Circle extends React.Component<CircleProps> {
    static contextType: React.Context<HEREMapContext>;
    static defaultProps: {
        fillColor: string;
        lineWidth: number;
        radius: number;
        strokeColor: string;
    };
    context: HEREMapContext;
    private circle?;
    componentDidUpdate(prevProps: CircleProps): void;
    componentWillUnmount(): void;
    private addCircleToMap;
    private setCenter;
    private setRadius;
    render(): null;
}
export default Circle;
