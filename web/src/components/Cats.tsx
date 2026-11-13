import cat1 from "../assets/cat 1.gif";
import cat2 from "../assets/cat 2.gif";
import cat3 from "../assets/cat 3.gif";
import cat4 from "../assets/cat 4.gif";
import cat5 from "../assets/cat 5.gif";

// Sprinkled over the whole screen, on top of everything. x/y is where each cat's centre
// sits, as a % of the screen.
const cats = [
  { src: cat1, x: 10, y: 12, tilt: -8 },
  { src: cat2, x: 86, y: 8, tilt: 7 },
  { src: cat3, x: 58, y: 26, tilt: 5 },
  { src: cat4, x: 22, y: 42, tilt: -6 },
  { src: cat5, x: 80, y: 48, tilt: 4 },
  { src: cat2, x: 44, y: 64, tilt: -5 },
  { src: cat5, x: 9, y: 78, tilt: 6 },
  { src: cat3, x: 90, y: 82, tilt: -4 },
  { src: cat1, x: 62, y: 92, tilt: 8 },
];

export function Cats() {
  return (
    <div className="cats" aria-hidden="true">
      {cats.map(({ src, x, y, tilt }, i) => (
        <img
          key={i}
          className="cat"
          src={src}
          alt=""
          style={{ left: `${x}%`, top: `${y}%`, rotate: `${tilt}deg`, animationDelay: `${i * 100}ms` }}
        />
      ))}
    </div>
  );
}
