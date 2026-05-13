import { Coordinate } from "./Location/Coordinate";

export enum WindExposure {
  EXPUESTO = "expuesto",
  PARCIALMENTE_EXPUESTO = "parcialmente expuesto",
  PROTEGIDO = "protegido",
  TUNEL_DE_VIENTO = "tunel de viento",
}

export enum VigorType {
  EXCELENTE = "excelente",
  NORMAL = "normal",
  POBRE = "pobre",
}

export enum CanopyDensityType {
  ESCASA = "escasa",
  NORMAL = "normal",
  DENSA = "densa",
}

export enum GrowthSpaceType {
  SIN_CAZUELA = "sin cazuela",
  CAZUELA_IGUAL_1_A_2_M2 = "cazuela = 1 - 2 m2",
  CAZUELA_MENOR_A_2_M2 = "cazuela > 2 m2",
  VEREDA_JARDIN = "vereda jardín",
}

export enum TreeValueType {
  HISTORICO = "historico",
  MONUMENTAL = "monumental",
  SINGULAR = "singular",
  NOTABLE = "notable",
  PLAZA_O_PARQUE_ORNAMENTAL = "plaza/parque (ornamental)",
  RECLAMO = "reclamo",
}

export interface Defect {
  defectName: string;
  defectValue: number;
  textDefectValue: string;
  branches: number;
}

export enum StreetMaterialityType {
  TIERRA = "tierra",
  MEJORADO_PETROLEO = "mejorado petroleo",
  ASFALTO = "asfalto",
  CONCRETO = "concreto",
  CORDON_CUNETA = "cordon cuneta",
}

export interface DefectDto {
  defectName: string;
  defectValue: number;
  textDefectValue: string;
  branches: number | null;
}

export class Tree {
  // No opcionales, para de vista rapida de datos de arbol, sin detalles
  idTree: number;
  latitude: number;
  longitude: number;
  address: string;
  datetime: Date;
  risk: number = 0;

  // Sirven para vista en detalle
  idNeighborhood?: number;
  neighborhoodName?: string;
  isDead?: boolean;
  isMissing?: boolean;
  height?: number;
  perimeter?: number;
  dch?: number;
  vigor?: string;
  treesInTheBlock?: number;
  useUnderTheTree?: string;
  frequencyUse?: number;
  potentialDamage?: number;
  isMovable?: boolean;
  isRestrictable?: boolean;
  exposedRoots?: boolean;
  windExposure?: string;
  canopyDensity?: string;
  growthSpace?: string;
  treeValue?: string;
  streetMateriality?: string;
  conflictsNames?: string[];
  defects?: Defect[];
  diseasesNames?: string[];
  interventionsNames?: string[];
  pestsNames?: string[];
  treeInfoCollectionTime?: number;
  treeTypeName?: string;
  gender?: string;
  species?: string;
  scientificName?: string;
  color?: string;
  pathPhoto?: string;
  defectDto?: DefectDto[];
  cityBlock?: number;
  incline?: number;
  coordinate?: Coordinate;

  constructor() {
    this.idTree = 0;
    this.latitude = 0;
    this.longitude = 0;
    this.address = "";
    this.datetime = new Date();
    this.risk = 0;
    this.treeTypeName = "";
    this.conflictsNames = [];
    this.diseasesNames = [];
    this.interventionsNames = [];
    this.pestsNames = [];
    this.pathPhoto = "";
  }
}

export interface TreeLight {
  idTree: number;
  address: string;
  datetime: number;
  treeValue: string;
  treeTypeName: string;
  risk: string;
  lat: number;
  lng: number;
}

export enum TreeSpecie {
  Tipa = "Tipa (Tipuana tipu)",
  Palo = "Palo Borracho (Ceiba sp)",
  Jacarandá = "Jacarandá (Jacaranda mimosifolia)",
  Lapacho = "Lapacho (Handroanthus sp)",
  Fresno = "Fresno (Fraxinus sp)",
  Morera = "Morera (Morus sp)",
  Sauce = "Sauce (Salix Sp)",
  AlamoPlateado = "Álamo plateado (Populus alba)",
  Chañar = "Chañar (Geoffroea decorticans)",
  Eucaliptus = "Eucaliptus (Eucalyptus globulus)",
  Laurel = "Laurel de jardin (Nerium oleander)",
  Pino = "Pino (Pinus sp)",
  AcaciaNegra = "Acacia negra (Gleditsia triacanthos)",
  Curupí = "Curupí (Sapium haematospermum)",
  Casuarina = "Casuarina (Casuarina cunninghamiana)",
  Acer = "Acer negundo (Acer negundo)",
  Timbó = "Timbó (Enterolobium contortisiliquum)",
  Cina = "Cina cina (Parkisonia acuelata)",
  Aromito = "Aromito (Vachellia caven)",
  Ceibo = "Ceibo (Erythrina crista-galli)",
  Ibirá = "Ibirá pitá (Peltophorum dubium)",
  Crespón = "Crespón (Lagerstroemia indica)",
  Liquidambar = "Liquidambar (Liquidambar styraciflua)",
  Palmera = "Palmera Pindó (Syagrus romanzoffiana)",
  Tilo = "Tilo (Tilia platyphyllos)",
  Aguaribay = "Aguaribay (Schinus areira)",
  SauceElectrico = "Sauce eléctrico (Salix × erythroflexuosa) ",
  PezuñaDeVaca = "Pezuña de vaca (Bauhinia variegata)",
  Paraíso = "Paraíso (Melia azedarach)",
  Ligustro = "Ligustro (Ligustrum lucidum)",
  Tala = "Tala (Celtis tala)",
  Tevetia = "Tevetia (Thevetia Peruviana)",
  Guarán = "Guarán (Tecoma stans)",
  Roble = "Roble (Quercus rubus)",
  Platano = "Platano de sombra (Platanus x hispanica)",
  Canelón = "Canelón (Myrsine laetevirens)",
  AlamoDeltoide = "Álamo deltoides (Populus deltoides)",
  Grevillea = "Grevillea (Grevillea robusta)",
  Níspero = "Níspero (Mespilus germanica)",
  Ciprés = "Ciprés (Cupressus sempervirens)",
  Nogal = "Nogal común (Juglans regia)",
  RobleAmericano = "Roble americano (Quercus rubra)",
  Brachichito = "Brachichito (Brachychiton populneus)",
  TipaColorada = "Tipa Colorada (Pterogyne nitens)",
  AlamoPiramidal = "Álamo piramidal (Populus nigra)",
  Chivato = "Chivato (Delonix regia)",
  Palta = "Palta (Persea americana)",
  Acacia = "Acacia de Constantinopla (Albizia julibrissin)",
  Algarrobo = "Algarrobo (Prosopis sp)",
  Olmo = "Olmo común (Ulmus minor)",
  Vilcote = "Vilcote (Acacia visco)",
  Pezuña = "Pezuña de vaca nativa (Bauhinia forficata subsp. pruinosa)",
  Alamo = "Álamo (Populus nigra)",
  LigustroDisciplinado = "Ligustro disciplinado (Ligustrum japonica variegata)",
  Ficus = "Ficus disciplinado (Ficus benjamina variegata)",
  Catalpa = "Catalpa (Catalpa sp.)",
}
