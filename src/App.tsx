import { ChakraProvider, defaultSystem } from "@chakra-ui/react";
import { Toaster } from "./utils/toaster";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import { Pages, SearchParam } from "./types/Pages";
import { DataProvider } from "./context/dataContext";
import { QueryParamConfigMap, QueryParamProvider, StringParam } from "use-query-params";
import { ReactRouter6Adapter } from "use-query-params/adapters/react-router-6";
import { FilterName } from "./types/Filter";
import Home from "./pages/Home";
import ProjectForm from "./pages/ProjectForm";
import TreeList from "./pages/TreeList";
import EditCampaign from "./pages/EditCampaign";
import Register from "./pages/Register";
import Header from "./components/Header/Header";
import { AuthProvider } from "./context/authContext";
import ManageUnitWorks from "./pages/ManageUnitWorks";
import CityLayout from "./pages/CityLayout";
import TreeLayout from "./pages/TreeLayout";
import NeighborhoodLayout from "./pages/NeighborhoodLayout";
import AssignUsers from "./pages/AssignUsers";
import PasswordReset from "./pages/PasswordReset";
import ListUsers from "./pages/ListUsers";
import ManageNeighborhood from "./pages/ManageNeighborhood";
import UnitWorkDetails from "./pages/UnitWorkDetails";

const getAllQueryParamsOptions = (): QueryParamConfigMap => {
  const searchParams = Object.values(SearchParam);
  const filterNameParams = Object.keys(FilterName);
  const obj: QueryParamConfigMap = [...searchParams, ...filterNameParams].reduce(
    (acc: QueryParamConfigMap, key) => {
      acc[key] = StringParam;
      return acc;
    },
    {},
  );
  return obj;
};

export const App = () => {
  return (
    <ChakraProvider value={defaultSystem}>
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <QueryParamProvider
          adapter={ReactRouter6Adapter}
          options={{ params: getAllQueryParamsOptions() }}
        >
          <AuthProvider>
            <DataProvider>
              <Header />
              <Routes>
                {/* Rutas publicas */}
                <Route path="/" element={<Navigate to={Pages.Login} replace />} />
                <Route path={Pages.Login} element={<Login />} />
                <Route path={Pages.Register} element={<Register />} />

                <Route path={Pages.EditUser} element={<Register />} />
                <Route path={Pages.TreeLayout} element={<TreeLayout />} />
                <Route path={Pages.NeighborhoodLayout} element={<NeighborhoodLayout />} />
                <Route path={Pages.ManageNeighborhood} element={<ManageNeighborhood />} />
                <Route path={Pages.AssignUsers} element={<AssignUsers />} />
                <Route path={Pages.ListUsers} element={<ListUsers />} />
                <Route path={Pages.CityLayout} element={<CityLayout />} />
                <Route path={Pages.Home} element={<Home />} />
                <Route path={Pages.FormProject} element={<ProjectForm />} />
                <Route path={Pages.EditProject} element={<ProjectForm />} />
                <Route path={Pages.TreeList} element={<TreeList />} />
                <Route path={Pages.UnitWorkDetails} element={<UnitWorkDetails />} />
                <Route path={Pages.EditCampaign} element={<EditCampaign />} />
                <Route path={Pages.PasswordReset} element={<PasswordReset />} />
                <Route path={Pages.ManageUnitWorks} element={<ManageUnitWorks />} />
              </Routes>
            </DataProvider>
          </AuthProvider>
        </QueryParamProvider>
      </BrowserRouter>
    </ChakraProvider>
  );
};
