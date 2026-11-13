import artistGarden from "./assets/artist garden.webp";
import beach from "./assets/beach.webp";
import cliff from "./assets/cliff.jpg";
import gardenAtSainte from "./assets/garden at sainte.jfif";
import house from "./assets/house.jpg";
import lilies2 from "./assets/lilies 2.webp";
import lilies3 from "./assets/lilies 3.webp";
import lilies from "./assets/lilies.jfif";
import manneporte from "./assets/manneporte.jfif";
import monetBridge from "./assets/monet bridge.jfif";
import parasol from "./assets/parasol.jpg";
import pourville from "./assets/pourville.jfif";
import purpleFlowers from "./assets/purple flowers.jfif";
import sanGiorgio from "./assets/san giorgio.jpg";
import shippingByMoonlight from "./assets/shipping by moonlight.jpg";
import sunflowers from "./assets/sunflowers.jfif";

// One Monet per card, in timeline order. 16 paintings for 14 schools; repeats only past 16.
const paintings = [
  lilies,
  monetBridge,
  parasol,
  artistGarden,
  beach,
  cliff,
  gardenAtSainte,
  house,
  lilies2,
  manneporte,
  pourville,
  purpleFlowers,
  sanGiorgio,
  sunflowers,
  lilies3,
  shippingByMoonlight,
];

export const paintingFor = (index: number): string => paintings[index % paintings.length];
