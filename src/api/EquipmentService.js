import AgentService from './AgentService';

const PATH = '/equipments';

class EquipmentService extends AgentService {
  static async getEquipments() {
    const response = await super.get(PATH);
    return (response);
  }

  static async createEquipment(equipment) {
    const response = await super.post(PATH, equipment);
    return (response);
  }

  static async updateEquipment(equipment) {
    const response = await this.put(PATH, equipment);
    return (response);
  }

  static async deleteEquipmentById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }
}

export default EquipmentService;

// INSERT INTO `orion`.`Equipments` (`name`, `type`, `styleId`, `maxCapacity`,
// `minCapacity`, `minHours`, `maxDistance`, `description`, `licensePlate`, `vin`,
// `image`, `currentAvailability`, `hourRate`, `tonRate`, `rateType`, `companyId`,
// `defaultDriverId`, `driverEquipmentsId`, `driversId`, `equipmentAddressId`,
// `modelId`, `makeId`, `notes`, `createdBy`, `createdOn`, `modifiedBy`,
// `modifiedOn`, `isArchived`) VALUES ('Truck #2', '45', '45', '25000', '20000',
// '8', '77', 'Truck Description', 'JJJ787', 'KvinNumber', 'AWS S3 Path 3', '1',
// '105', '45', '2', '19', '5', '1', '4', '5', '1', '2', 'Notes about this truck',
// '5', '2019-02-22', '1', '2019-02-22', '0');
