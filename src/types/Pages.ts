export enum Pages {
  TreeLayout = "/trees/:idProject/:idUnitWork?",
  CityLayout = "/city/:idProject",
  ListUsers = "/listusers",
  NeighborhoodLayout = "/neighborhood/:idProject",
  Login = "/login",
  Neighborhood = "/neighborhood",
  Register = "/register",
  EditUser = "/edituser/:idUser",
  PasswordReset = "/passwordreset",
  Home = "/home",
  Project = "/project/:idProject/tree",
  FormProject = "/formproject",
  ProyectoMuestreo = "/proyectomuestreo",
  EditProject = "/editproject/:idProject",
  AssignUsers = "/assignusers/:idProject",
  ManageUnitWorks = "/unitworks/:idProject",
  UnitWorkDetails = "/unitworkdetails/:idProject",
  TreeList = "/treelist/:idProject/:idUnitWork?",
  TreeMapByNeighborhood = "/mapbarrio/:idProject",
  EditCampaign = "/editcampaign/:idCampaign",
  ManageNeighborhood = "/manageneighborhood",
}

export enum SearchParam {
  Id = "id",
  StartDate = "startDate",
  EndDate = "endDate",
}
