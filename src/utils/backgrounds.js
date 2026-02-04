
import img1 from '../assets/fondo.jpg';
import img2 from '../assets/fondo1.jpg';
import img3 from '../assets/fondo2.jpg';
import img4 from '../assets/fondo3.jpg';
import img5 from '../assets/fondo4.jpg';
import img6 from '../assets/fondo5.png';
import img7 from '../assets/login.jpg';
import img8 from '../assets/registro.jpg';
import img9 from '../assets/pala.jpg';


export const loginBackgrounds = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
export const registerBackgrounds = [img1, img2, img3, img4, img5, img6, img7, img8, img9];
export const landingBackgrounds = [img1, img2, img3, img4, img5, img6, img7, img8, img9];

export const getRandomBackground = (type) => {
    let selectedArray;
    switch (type) {
        case 'login': selectedArray = loginBackgrounds; break;
        case 'register': selectedArray = registerBackgrounds; break;
        case 'landing': selectedArray = landingBackgrounds; break;
        default: selectedArray = loginBackgrounds;
    }
    return selectedArray[Math.floor(Math.random() * selectedArray.length)];
};