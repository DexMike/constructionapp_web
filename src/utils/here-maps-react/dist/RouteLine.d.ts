/// <reference types="heremaps" />
import React from 'react';
import { HEREMapContext } from './utils/map-context';
declare type Shape = string[];
export interface RouteLineProps extends H.map.Polyline.Options, H.geo.IPoint {
    strokeColor?: string;
    lineWidth?: number;
    shape: Shape;
}
declare class RouteLine extends React.Component<RouteLineProps> {
    static contextType: React.Context<HEREMapContext>;
    context: HEREMapContext;
    private routeLine?;
    componentDidUpdate(prevProps: RouteLineProps): void;
    componentWillUnmount(): void;
    private didShapeChange;
    private addRouteLineToMap;
    render(): null;
}
export default RouteLine;
