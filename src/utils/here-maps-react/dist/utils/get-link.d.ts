export interface LinkState {
    hasLoaded: boolean;
    wasRejected: boolean;
    error?: any;
    link: HTMLLinkElement;
}
/**
 * Get a style or other linked resource from a remote location.
 * @param url {string} - The URL/location of the resource to be retrieved.
 * @param name {string} - The name of the resource to be retrieved.
 */
export declare function getLink(url: string, name: string): LinkState | undefined;
export default getLink;
