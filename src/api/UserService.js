import AgentService from './AgentService';

const PATH = '/users';

class UserService extends AgentService {
  static async getUsers() {
    const response = await super.get(PATH);
    return (response);
  }

  // getUsersByCompanyIdAndType
  // input
  //    companyID: id of company
  //    type: of user from Lookups; use All to get everything
  //    TODO: NOTE: type is being ignored right now
  // Usage:
  // const equipments = await UserService.getUsersByCompanyIdAndType(
  //   profile.companyId,
  //   'All'
  // );
  static async getUsersByCompanyIdAndType(companyId, type) {
    const response = await this.get(`/company/${companyId}/type/${type}/users`);
    return (response);
  }

  static async getUserById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static async createUser(user) {
    const response = await super.post(PATH, user);
    return (response);
  }

  static async updateUser(user) {
    const response = await this.put(PATH, user);
    return (response);
  }

  static async deleteUserById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default UserService;

// INSERT INTO `orion`.`Equipments` (`name`, `type`, `styleId`, `maxCapacity`,
// `minCapacity`, `minHours`, `maxDistance`, `description`, `licensePlate`, `vin`,
// `image`, `currentAvailability`, `hourRate`, `tonRate`, `rateType`, `companyId`,
// `defaultDriverId`, `driverEquipmentsId`, `driversId`, `equipmentAddressId`,
// `modelId`, `makeId`, `notes`, `createdBy`, `createdOn`, `modifiedBy`,
// `modifiedOn`, `isArchived`) VALUES ('Truck #2', '45', '45', '25000', '20000',
// '8', '77', 'Truck Description', 'JJJ787', 'KvinNumber', 'AWS S3 Path 3', '1',
// '105', '45', '2', '19', '5', '1', '4', '5', '1', '2', 'Notes about this truck',
// '5', '2019-02-22', '1', '2019-02-22', '0');
