import {useTranslation} from "react-i18next";
import React from "react";

export const DashboardObject = ({title, val}) => {
  const {t} = useTranslation();
  return (
    <div className="col-12 col-md-2 col-lg-2">
      <div className="card">
        <div className="dashboard__card-widget card-body card-filter">
          <h5 className="card__title bold-text">
            <center>{t(title)}</center>
          </h5>
          <span><center><h4>{val}</h4></center></span>
        </div>
      </div>
    </div>
  )
}
