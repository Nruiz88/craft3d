type Colors = Record<string, string>;

function Sprite({
  map,
  colors,
  className = "",
}: {
  map: string[];
  colors: Colors;
  className?: string;
}) {
  return (
    <svg
      viewBox={`0 0 ${map[0].length} ${map.length}`}
      className={className}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {map.flatMap((row, y) =>
        [...row].map((pixel, x) => {
          const color = colors[pixel];
          if (!color) return null;
          return (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={color}
            />
          );
        }),
      )}
    </svg>
  );
}

const pikachuMap = [
  ".KKKKK....KKKKK.",
  "KYYYYK....KYYYYK",
  "KYBYYK....KYBYYK",
  "KYBYYK....KYBYYK",
  "KYYYYKKKKKKYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYYYYYYYYYYYYK",
  "KYYYKKYYYYKKYYYK",
  "KYYYKKYYYYKKYYYK",
  "KYYYYYYYYYYYYYYK",
  "KRRYYYYYYYYYYRRK",
  "KRRYYYYYYYYYYRRK",
  "KYYYYYYYYYYYYYYK",
  ".KYYYKKKKKKYYYK.",
  "KYYYYYYYYYYYYYYK",
  ".KKKKKKKKKKKKKK.",
];

const marioMap = [
  "..CCCCCCCCCCCC..",
  ".CCCCCCCCCCCCCC.",
  "CCCCCCCCCCCCCCCC",
  "CCCCCCCCCCCCCCCC",
  "CCCCCCBBBBBBCCCC",
  "CCCCCCCCCCCCCCCC",
  "SSSKKKSSSSKKKSSS",
  "SSSKKKSSSSKKKSSS",
  "SSSSSBBBBBBSSSSS",
  "SSSSSBBBBBBSSSSS",
  ".SSSSBBBBBBSSSS.",
  ".SSSSSSSSSSSSSS.",
  "..UUUUUUUUUUUU..",
  ".UUUUUUUUUUUUUU.",
  ".KKKKKKKKKKKKKK.",
  ".KKKKKKKKKKKKKK.",
];

const sonicMap = [
  ".BBBBBBBBBBBBBB.",
  "BBBBBBBBBBBBBBBB",
  "BBBBBBBBBBBBBBBB",
  "BBKKBBBBBBBBKKBB",
  "BBKWBBBBBBBBWKBB",
  "BBKKBBBBBBBBKKBB",
  "BBBBBBBBBBBBBBBB",
  "BBBBCCCCCCCCBBBB",
  "BBBCCCCCCCCCCBBB",
  "BBCCCCCNCCCCCCBB",
  "BBCCCCCCCCCCCCBB",
  "BBBBBBBBBBBBBBBB",
  ".BBBBBBBBBBBBBB.",
  "..BBBBBBBBBBBB..",
  "....BBBBBBBB....",
  "........BB......",
];

const ghostMap = [
  ".RRRRRRRRRRRRR..",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRWWWWRRWWWWRRR",
  "RRRWWWWRRWWWWRRR",
  "RRRWWBBRRBBWWRRR",
  "RRRWWBBRRBBWWRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  "RRWWRRWWRRWWRRWW",
];

const mushroomMap = [
  "........RRRR....",
  ".......RRRRRR...",
  "......RRRRRRRR..",
  ".....RRWRRRRWRR.",
  "....RRRWWWWRWRR.",
  "....RRWWWWWWRRR.",
  "...RRRRRRRRRRR..",
  "..RRRRRRRRRRRRRR",
  "RRRRRRRRRRRRRRRR",
  ".KKKKKKKKKKKKKK.",
  ".KWWWWWWWWWWWWK.",
  ".KWWWWWWWWWWWWK.",
  "KWWWKKWWWWKKWWWK",
  ".KWWWWWWWWWWWWWK.",
  "..KKKKKKKKKKKK..",
  "................",
];

const invaderMap = [
  "....GGGGGGGG....",
  "...GGGGGGGGGG...",
  "...GGGGGGGGGG...",
  "...GGG....GGG...",
  "...GGG.GGG.GGG..",
  "..GGGGGGGGGGGG..",
  "..GG.GGGGGG.GG..",
  "..GG.GGGGGG.GG..",
  "...GG......GG...",
  "....GG....GG....",
  "................",
  "................",
  "................",
  "................",
  "................",
  "................",
];

export function PixelPikachu({ className = "" }: { className?: string }) {
  return (
    <Sprite
      map={pikachuMap}
      colors={{ Y: "#F7D02C", K: "#1E1E1E", R: "#EF5350", B: "#B9832A" }}
      className={className}
    />
  );
}

export function PixelMario({ className = "" }: { className?: string }) {
  return (
    <Sprite
      map={marioMap}
      colors={{
        C: "#E52521",
        B: "#8B5A2B",
        S: "#FFB448",
        K: "#1E1E1E",
        U: "#049CD8",
      }}
      className={className}
    />
  );
}

export function PixelSonic({ className = "" }: { className?: string }) {
  return (
    <Sprite
      map={sonicMap}
      colors={{
        B: "#2F9BFF",
        K: "#1E1E1E",
        W: "#FFFFFF",
        C: "#F7E6C4",
        N: "#1E1E1E",
      }}
      className={className}
    />
  );
}

export function PixelGhost({ className = "" }: { className?: string }) {
  return (
    <Sprite
      map={ghostMap}
      colors={{ R: "#FF3B3B", W: "#FFFFFF", B: "#3B6BFF" }}
      className={className}
    />
  );
}

export function PixelMushroom({ className = "" }: { className?: string }) {
  return (
    <Sprite
      map={mushroomMap}
      colors={{ R: "#E52521", W: "#FFFFFF", K: "#1E1E1E" }}
      className={className}
    />
  );
}

export function PixelInvader({ className = "" }: { className?: string }) {
  return (
    <Sprite
      map={invaderMap}
      colors={{ G: "#39FF14" }}
      className={className}
    />
  );
}

export const arcadeCharacters = [
  { name: "PIKACHU", sprite: PixelPikachu },
  { name: "MARIO", sprite: PixelMario },
  { name: "SONIC", sprite: PixelSonic },
  { name: "BLINKY", sprite: PixelGhost },
  { name: "1-UP", sprite: PixelMushroom },
  { name: "INVADER", sprite: PixelInvader },
];
