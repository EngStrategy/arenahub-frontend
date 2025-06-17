import { 
  FaFutbol, FaVolleyballBall, FaBasketballBall, FaTableTennis, 
  FaFootballBall, FaBaseballBall, FaGolfBall, FaHockeyPuck 
} from 'react-icons/fa';
import { IoTennisball } from 'react-icons/io5';
import { GiShuttlecock, GiBeachBall } from 'react-icons/gi'; 

type SportIconMap = {
  [key: string]: JSX.Element | null;
};

export const sportIcons: SportIconMap = {
  'Futebol society': <FaFutbol className="mr-2" />,
  'Vôlei': <FaVolleyballBall className="mr-2" />,
  'Beach Tennis': <GiBeachBall className="mr-2" />,
  'Futsal': <FaFutbol className="mr-2" />,
  'Futebol 11': <FaFutbol className="mr-2" />,
  'Futebol de areia': <FaFutbol className="mr-2" />,
  'Futevôlei': <FaVolleyballBall className="mr-2" />,
  'Basquete': <FaBasketballBall className="mr-2" />,
  'Handebol': <FaVolleyballBall className="mr-2" />,
  "Ping Pong": <FaTableTennis className="mr-2" />,
  "Beisebol": <FaBaseballBall className="mr-2" />, 
  "Tênis": <IoTennisball className="mr-2" />, 
  "Golfe": <FaGolfBall className="mr-2" />, 
  'Futebol americano': <FaFootballBall className="mr-2" />,
  'Paddle': <FaTableTennis className="mr-2" />,
  'Squash': <FaTableTennis className="mr-2" />,
  'Badminton': <GiShuttlecock className="mr-2" />,
  'Peteca': <GiShuttlecock className="mr-2" />,
  'Rugby': <FaFootballBall className="mr-2" />,
  "Ultimate Frisbee": null,
  "Hóquei": <FaHockeyPuck className="mr-2" />, 
  "Lacrosse": null,
  "Críquete": null,
  "Softbol": <FaBaseballBall className="mr-2" />, 
};