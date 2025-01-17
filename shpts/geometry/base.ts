import { Coord, CoordType } from '@shpts/types/coordinate';
import { GeoJsonGeom } from '@shpts/types/geojson';
import { BoundingBox, GeomHeader } from '@shpts/types/data';
import { MemoryStream } from '@shpts/utils/stream';

export abstract class BaseRecord {
    constructor(readonly coordType: CoordType, private hasMValuesPresent: boolean) {}
    abstract toGeoJson(): GeoJsonGeom;

    get hasZ(): boolean {
        return this.coordType === CoordType.XYZM;
    }

    get hasOptionalM(): boolean {
        return this.coordType === CoordType.XYM || this.coordType === CoordType.XYZM;
    }

    get hasM(): boolean {
        return this.hasMValuesPresent;
    }

    get coordLength(): number {
        if (this.coordType === CoordType.XY) return 2;
        if (this.coordType === CoordType.XYM) return 3;
        return 4;
    }

    abstract get type(): string;

    protected static readBbox(stream: MemoryStream): BoundingBox {
        const xMin = stream.readDouble(true);
        const yMin = stream.readDouble(true);
        const xMax = stream.readDouble(true);
        const yMax = stream.readDouble(true);
        return {
            xMin: xMin,
            yMin: yMin,
            xMax: xMax,
            yMax: yMax,
        };
    }

    static recordReadingFinalized(shpStream: MemoryStream, header: GeomHeader) {
        //per spec, each record is (4 + header.length) * 2 bytes long
        //if the stream is at the end of the record, then we are good
        return shpStream.tell === header.offset + (4 + header.length) * 2;
    }
}

export abstract class BaseRingedRecord extends BaseRecord {
    protected static getZValues(shpStream: MemoryStream, numPoints: number) {
        shpStream.readDouble(true); // skip zMin
        shpStream.readDouble(true); // skip zMax
        return shpStream.readDoubleArray(numPoints, true);
    }

    protected static getMValues(shpStream: MemoryStream, numPoints: number) {
        shpStream.readDouble(true); // skip mMin
        shpStream.readDouble(true); // skip mMax
        return shpStream.readDoubleArray(numPoints, true);
    }

    protected static getCoords(
        parts: Int32Array,
        xy: Float64Array,
        z?: Float64Array,
        m?: Float64Array
    ) {
        const coords: Coord[][] = [];
        for (let i = 0; i < parts.length; ++i) {
            const line: Coord[] = [];
            const start = parts[i];
            const end = parts[i + 1] || xy.length / 2;
            for (let j = start; j < end; j++) {
                const coord = [];
                coord.push(xy[j * 2]);
                coord.push(xy[j * 2 + 1]);
                if (z) coord.push(z[j]);
                if (m) coord.push(m[j]);
                line.push(coord as Coord);
            }
            coords.push(line);
        }
        return coords;
    }
}
