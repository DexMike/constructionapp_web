import React from "react";
import {useTranslation} from "react-i18next";
import classNames from "classnames";


export const DashboardObjectClickable = ({title, displayVal, handle, name, value, status}) => {
  const {t} = useTranslation();
  const func = () => {
    return handle({value, name})
  }
  const cardClass = classNames({
    "dashboard__card-widget card-body card-filter active": value === status,
    "dashboard__card-widget card-body card-filter": value != status,
  });
  return (
    <div className="col-12 col-md-2 col-lg-2">
      <div className="card">
        <div className={cardClass} onClick={func}>
          <h5 className="card__title bold-text">
            <center>{t(title)}</center>
          </h5>
          <span><center><h4>{displayVal}</h4></center></span>
        </div>
      </div>
    </div>
  )
}
