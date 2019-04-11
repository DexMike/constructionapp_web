import React from "react";
import {useTranslation} from "react-i18next";


export const DashboardObjectStatic = ({title, displayVal}) => {
  const {t} = useTranslation();
  return (
    <div className="col-12 col-md-2 col-lg-2">
      <div className="card">
        <div className="dashboard__card-widget card-body">
          <h5 className="card__title bold-text">
            <center>{t(title)}</center>
          </h5>
          <span><center><h4>{displayVal}</h4></center></span>
        </div>
      </div>
    </div>
  )
}