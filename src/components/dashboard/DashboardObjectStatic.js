import React from 'react';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';


export const DashboardObjectStatic = ({title, displayVal}) => {
  const {t} = useTranslation();
  return (
    <div className="col">
      <div className="card">
        <div className="dashboard__card-widget card-body">
          <h5 className="card__title bold-text">
            <center>{t(title)}</center>
          </h5>
          <span><center><h4>{displayVal}</h4></center></span>
        </div>
      </div>
    </div>
  );
};

DashboardObjectStatic.propTypes = {
  title: PropTypes.string,
  displayVal: PropTypes.number
};

DashboardObjectStatic.defaultProps = {
  title: '',
  displayVal: 0
};

export default DashboardObjectStatic;
