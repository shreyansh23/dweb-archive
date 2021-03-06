import React from 'react';
import IAReactComponent from '../IAReactComponent';
const debug = require('debug')('dweb-archive:AnchorDownload');

// Utility functions, I (Mitra) like to put these on Object, but maybe better here.
function ObjectFromEntries(arr) { arr.reduce((res,kv)=>(res[kv[0]]=kv[1],res),{});} // [[ k0, v0],[k1,v1] => {k0:v0, k1:v1}
function ObjectFilter(obj, f) { ObjectFromEntries( Object.entries(obj).filter(kv=>f(kv[0], kv[1]))); }

/* Clone of AnchorDetails with minor changes*/

export default class AnchorDownload extends IAReactComponent {

    constructor(props)
    {
        super(props); // identifier, format, source=ArchiveFile, children and a range of other props
    }
    clickCallable(unused_ev) {
        // Note this is only called in dweb; !Dweb has a director href
        debug("Clicking on link to download: %s",this.props.identifier);
        // noinspection JSIgnoredPromiseFromCall
        DwebArchive.Nav.nav_download(this.props.source);
        return false; // Stop event propagating
    }
    render() {
        // this.props passes identifier which is required for Dweb, but typically also passes tabIndex, class, title
        const url = new URL( ( (this.props.filename && typeof this.props.filename === "string")                     // filename = foo.jpg
                ? `https://archive.org/download/${this.props.identifier}/${this.props.filename}`
                : (this.props.source && Array.isArray(this.props.source) && this.props.source.length === 1)         // source = [ArchiveFile]
                ? `https://archive.org/download/${this.props.identifier}/${this.props.source[0].metadata.name}`
                : this.props.format                                                                                 // source = [ArchiveFile]
                ? `https://archive.org/compress/${this.props.identifier}/formats=${this.props.format}&file=/${this.props.identifier}.zip`
                : (typeof DwebArchive === "undefined")                                                              // just identifier !dweb
                ? 'https://archive.org/download/${this.props.identifier}'
                : 'https://dweb.archive.org/download/${this.props.identifier'));                                    // just identifier dweb
        const usp = new URLSearchParams;
        AnchorDownload.urlparms.forEach(k=> usp.append(k, this.props[k]));
        usp.search = usp; // Note this copies, not updatable
        const anchorProps = ObjectFilter(this.props, (k,unused_v)=>!AnchorDownload.urlparms.includes(k));
        return ( // Note there is intentionally no spacing in case JSX adds a unwanted line break
            (typeof DwebArchive === "undefined") ?
                <a href={url.href} {...anchorProps} target="_blank">{this.props.children}</a>
            :
                // This is the Dweb version for React|!React
                <a href={url.href} onClick={this.onClick}  {...anchorProps}>{this.props.children}</a>
            );
    }
}
AnchorDownload.urlparms=[]; // Properties that go in the URL to details
// Other props are passed to anchor, known inuse include: className, source, title, data-toggle data-placement data-container target
