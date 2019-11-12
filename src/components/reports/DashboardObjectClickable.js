import React from 'react';
import {useTranslation} from 'react-i18next';
import classNames from 'classnames';
import PropTypes from 'prop-types';

const DashboardObjectClickable = ({
  title,
  displayVal,
  handle,
  name,
  value,
  status
}) => {
  const {t} = useTranslation();
  const func = () => handle({value, name});
  const cardClass = classNames({
    'dashboard__card-widget card-body card-filter active': value === status,
    'dashboard__card-widget card-body card-filter': value !== status
  });
  return (
    <div
      className="col"
    >
      <div className="card">
        <div
          className={cardClass}
          onClick={func}
          role="presentation"
        >
          <h5 className="card__title bold-text">
            <center>{t(title)}</center>
          </h5>
          <span><center><h4>{displayVal}</h4></center></span>
        </div>
      </div>
    </div>
  );
};

DashboardObjectClickable.propTypes = {
  title: PropTypes.string,
  displayVal: PropTypes.number,
  value: PropTypes.string,
  handle: PropTypes.func.isRequired,
  name: PropTypes.string,
  status: PropTypes.string
};

DashboardObjectClickable.defaultProps = {
  title: '',
  displayVal: 0,
  value: '',
  name: '',
  status: ''
};

export default DashboardObjectClickable;
