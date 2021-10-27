/* eslint-disable no-bitwise */
/*
    MurmurHash3
    ---------------
    32-bit MurmurHash3 implemented by bryc (github.com/bryc)
*/

export function MurmurHash3(key: number[], seed = 0) {
    const p1 = 3432918353;
    const p2 = 461845907;
    const b = key.length & -4;
    let k: number;
    let h = seed | 0;

    let i: number;
    for(i = 0; i < b; i += 4) {
        k = key[i+3] << 24 | key[i+2] << 16 | key[i+1] << 8 | key[i];
        k = Math.imul(k, p1); k = k << 15 | k >>> 17;
        h ^= Math.imul(k, p2); h = h << 13 | h >>> 19;
        h = Math.imul(h, 5) + 3864292196 | 0; // |0 = prevent float
    }

    k = 0;
    switch (key.length & 3) {
        case 3: k ^= key[i+2] << 16;
        // eslint-disable-next-line no-fallthrough
        case 2: k ^= key[i+1] << 8;
        // eslint-disable-next-line no-fallthrough
        case 1: k ^= key[i];
                k = Math.imul(k, p1); k = k << 15 | k >>> 17;
                h ^= Math.imul(k, p2);
    }

    h ^= key.length;

    h ^= h >>> 16; h = Math.imul(h, 2246822507);
    h ^= h >>> 13; h = Math.imul(h, 3266489909);
    h ^= h >>> 16;

    return h >>> 0;
}
