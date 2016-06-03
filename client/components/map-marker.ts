export interface MapMarker {
    fillColor: string;
    fillOpacity: number;
    markerType: MapMarker.Type;
    opacity: number;
    // SVG rendering of icon image represented by a path.
    // Paths are copied from the SVGs of Font Awesome's icons.
    path: string;
    rotation: number;
    scale: number;
    strokeColor: string;
    strokeOpacity: number;
    strokeWeight: number;
    // Width of SVG, which was determined separately and hard-coded.
    // This is used to re-center the icon over the map location.
    width: number;
    zIndex: number;
}

export module MapMarker {

    export const enum Type {
        PLACE,
        PLAN
    }

    export const MARKER: MapMarker = {
        fillColor: "#82ffeb",
        fillOpacity: 1,
        markerType: Type.PLACE,
        opacity: 0.7,
        path: `
            M768 896q0 106 -75 181t-181 75t-181 -75t-75 -181t75 -181t181
            -75t181 75t75 181zM1024 896q0 -109 -33 -179l-364 -774q-16 -33 -47.5
            -52t-67.5 -19t-67.5 19t-46.5 52l-365 774q-33 70 -33 179q0 212 150
            362t362 150t362 -150t150 -362z
        `,
        rotation: 180,
        scale: 0.02,
        strokeColor: "black",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        width: 1024,
        zIndex: 1
    };

    export const STAR: MapMarker = {
        fillColor: "#ff9c50",
        fillOpacity: 1,
        markerType: Type.PLAN,
        opacity: 0.7,
        path: `
            M1664 889q0 -22 -26 -48l-363 -354l86 -500q1 -7 1 -20q0 -21 -10.5
            -35.5t-30.5 -14.5q-19 0 -40 12l-449 236l-449 -236q-22 -12 -40
            -12q-21 0 -31.5 14.5t-10.5 35.5q0 6 2 20l86 500l-364 354q-25 27 -25
            48q0 37 56 46l502 73l225 455q19 41 49 41t49 -41l225 -455 l502
            -73q56 -9 56 -46z
        `,
        rotation: 180,
        scale: 0.02,
        strokeColor: "black",
        strokeOpacity: 0.5,
        strokeWeight: 1,
        width: 1664,
        zIndex: 100
    };

}
