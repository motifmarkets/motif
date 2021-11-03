export namespace MurmurHash3 {
    /* eslint-disable no-bitwise */
    /*
        MurmurHash3
        ---------------
        32-bit MurmurHash3 implemented by bryc (github.com/bryc)
        Each number is one byte
    */

    export function hashNumberBytes(key: number[], seed = 0) {
        const p1 = 3432918353;
        const p2 = 461845907;
        const b = key.length & -4;
        let k: number;
        let h = seed | 0;

        let i: number;
        for(i = 0; i < b; i += 4) {
            k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
            k = Math.imul(k, p1);
            k = k << 15 | k >>> 17;
            h ^= Math.imul(k, p2);
            h = h << 13 | h >>> 19;
            h = Math.imul(h, 5) + 3864292196 | 0; // |0 = prevent float
        }

        k = 0;
        switch (key.length & 3) {
            case 3: k ^= key[i+2] << 16;
            // eslint-disable-next-line no-fallthrough
            case 2: k ^= key[i+1] << 8;
            // eslint-disable-next-line no-fallthrough
            case 1: k ^= key[i];
                    k = Math.imul(k, p1);
                    k = k << 15 | k >>> 17;
                    h ^= Math.imul(k, p2);
        }

        h ^= key.length;

        h ^= h >>> 16; h = Math.imul(h, 2246822507);
        h ^= h >>> 13; h = Math.imul(h, 3266489909);
        h ^= h >>> 16;

        return h >>> 0;
    }

    export function hashBytes(key: Uint8Array, seed = 0) {
        const p1 = 3432918353;
        const p2 = 461845907;
        const b = key.length & -4;
        let k: number;
        let h = seed | 0;

        let i: number;
        for(i = 0; i < b; i += 4) {
            const k3: number = key[i+3];
            const k2: number = key[i+2];
            const k1: number = key[i+1];
            k = k3 << 24 | k2 << 16 | k1 << 8 | key[i];
            k = Math.imul(k, p1);
            k = k << 15 | k >>> 17;
            h ^= Math.imul(k, p2);
            h = h << 13 | h >>> 19;
            h = Math.imul(h, 5) + 3864292196 | 0; // |0 = prevent float
        }

        k = 0;
        switch (key.length & 3) {
            case 3:
                const k2 = key[i+2];
                k ^= k2 << 16;
            // eslint-disable-next-line no-fallthrough
            case 2:
                const k1 = key[i+1];
                k ^= k1 << 8;
            // eslint-disable-next-line no-fallthrough
            case 1:
                k ^= key[i];
                k = Math.imul(k, p1);
                k = k << 15 | k >>> 17;
                h ^= Math.imul(k, p2);
        }

        h ^= key.length;

        h ^= h >>> 16; h = Math.imul(h, 2246822507);
        h ^= h >>> 13; h = Math.imul(h, 3266489909);
        h ^= h >>> 16;

        return h >>> 0;
    }

    /*
    *  The MurmurHash3 algorithm was created by Austin Appleby.  This JavaScript port was authored
    *  by whitequark (based on Java port by Yonik Seeley) and is placed into the public domain.
    *  The author hereby disclaims copyright to this source code.
    *
    *  This produces exactly the same hash values as the final C++ version of MurmurHash3 and
    *  is thus suitable for producing the same hash values across platforms.
    *
    *  There are two versions of this hash implementation. First interprets the string as a
    *  sequence of bytes, ignoring most significant byte of each codepoint. The second one
    *  interprets the string as a UTF-16 codepoint sequence, and appends each 16-bit codepoint
    *  to the hash independently. The latter mode was not written to be compatible with
    *  any other implementation, but it should offer better performance for JavaScript-only
    *  applications.
    *
    *  See http://github.com/whitequark/murmurhash3-js for future updates to this file.
    */

    // function mul32(m: number, n: number) {
    //     const nlo = n & 0xffff;
    //     const nhi = n - nlo;
    //     return ((nhi * m | 0) + (nlo * m | 0)) | 0;
    // }

    export function hashStringBytes(data: string, len: number, seed = 0) {
        const c1 = 0xcc9e2d51;
        const c2 = 0x1b873593;

        let h1 = seed;
        const roundedEnd = len & ~0x3;

        for (let i = 0; i < roundedEnd; i += 4) {
            let k1 = (data.charCodeAt(i) & 0xff)        |
                ((data.charCodeAt(i + 1) & 0xff) << 8)  |
                ((data.charCodeAt(i + 2) & 0xff) << 16) |
                ((data.charCodeAt(i + 3) & 0xff) << 24);

            k1 = Math.imul(k1, c1);
            k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
            k1 = Math.imul(k1, c2);

            h1 ^= k1;
            h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19);  // ROTL32(h1,13);
            h1 = (h1 * 5 + 0xe6546b64) | 0;
        }

        let kEnd = 0;

        switch(len % 4) {
            case 3:
                kEnd = (data.charCodeAt(roundedEnd + 2) & 0xff) << 16;
                // fallthrough
            case 2:
                kEnd |= (data.charCodeAt(roundedEnd + 1) & 0xff) << 8;
                // fallthrough
            case 1:
                kEnd |= (data.charCodeAt(roundedEnd) & 0xff);
                kEnd = Math.imul(kEnd, c1);
                kEnd = ((kEnd & 0x1ffff) << 15) | (kEnd >>> 17);  // ROTL32(k1,15);
                kEnd = Math.imul(kEnd, c2);
                h1 ^= kEnd;
        }

        // finalization
        h1 ^= len;

        // fmix(h1);
        h1 ^= h1 >>> 16;
        h1  = Math.imul(h1, 0x85ebca6b);
        h1 ^= h1 >>> 13;
        h1  = Math.imul(h1, 0xc2b2ae35);
        h1 ^= h1 >>> 16;

        return h1;
    }

    export function hashUtf16String(data: string, len: number, seed = 0) {
        const c1 = 0xcc9e2d51;
        const c2 = 0x1b873593;

        let h1 = seed;
        const roundedEnd = len & ~0x1;

        let k1: number;
        for (let i = 0; i < roundedEnd; i += 2) {
            k1 = data.charCodeAt(i) | (data.charCodeAt(i + 1) << 16);

            k1 = Math.imul(k1, c1);
            k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
            k1 = Math.imul(k1, c2);

            h1 ^= k1;
            h1 = ((h1 & 0x7ffff) << 13) | (h1 >>> 19);  // ROTL32(h1,13);
            h1 = (h1 * 5 + 0xe6546b64) | 0;
        }

        if((len % 2) === 1) {
            k1 = data.charCodeAt(roundedEnd);
            k1 = Math.imul(k1, c1);
            k1 = ((k1 & 0x1ffff) << 15) | (k1 >>> 17);  // ROTL32(k1,15);
            k1 = Math.imul(k1, c2);
            h1 ^= k1;
        }

        // finalization
        h1 ^= (len << 1);

        // fmix(h1);
        h1 ^= h1 >>> 16;
        h1  = Math.imul(h1, 0x85ebca6b);
        h1 ^= h1 >>> 13;
        h1  = Math.imul(h1, 0xc2b2ae35);
        h1 ^= h1 >>> 16;

        return h1;
    }
}
