/// <reference types="heremaps" />
import React from 'react';
import { HEREMapContext } from './utils/map-context';
export interface MarkerProps extends H.map.Marker.Options, H.geo.IPoint {
    bitmap?: string;
    draggable?: boolean;
    onDragStart?: (e: H.util.Event) => void;
    onDrag?: (e: H.util.Event) => void;
    onDragEnd?: (e: H.util.Event) => void;
}
export declare class Marker extends React.Component<MarkerProps> {
    static contextType: React.Context<HEREMapContext>;
    context: HEREMapContext;
    private marker?;
    componentDidMount(): void;
    componentDidUpdate(prevProps: MarkerProps): void;
    componentWillUnmount(): void;
    private addMarkerToMap;
    private setPosition;
    render(): null;
}
export default Marker;
