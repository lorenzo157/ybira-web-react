import {
  BreadcrumbCurrentLink,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbRoot,
} from "@chakra-ui/react";
import { FC } from "react";
import { Pages } from "../../types/Pages";
import { Link } from "react-router-dom";

interface Props {
  currentPage: Pages;
  separator?: string;
}

const BreadcrumbComponent: FC<Props> = ({ currentPage }) => {
  return (
    <BreadcrumbRoot>
      <BreadcrumbItem>
        {currentPage === Pages.Home ? (
          <BreadcrumbCurrentLink>Mapa/Ciudad</BreadcrumbCurrentLink>
        ) : (
          <BreadcrumbLink asChild>
            <Link to={Pages.Home}>Mapa/Ciudad</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>

      <BreadcrumbItem>
        {currentPage === Pages.Neighborhood ? (
          <BreadcrumbCurrentLink>Barrio</BreadcrumbCurrentLink>
        ) : (
          <BreadcrumbLink asChild>
            <Link to={Pages.Neighborhood}>Barrio</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>

      <BreadcrumbItem>
        {currentPage === Pages.TreeLayout ? (
          <BreadcrumbCurrentLink>Arbol</BreadcrumbCurrentLink>
        ) : (
          <BreadcrumbLink asChild>
            <Link to={Pages.TreeLayout}>Arbol</Link>
          </BreadcrumbLink>
        )}
      </BreadcrumbItem>
    </BreadcrumbRoot>
  );
};

export default BreadcrumbComponent;
