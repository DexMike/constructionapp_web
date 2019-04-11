import moment from 'moment';
import AgentService from './AgentService';

const PATH = '/bookings';

class BookingService extends AgentService {
  static async getBookings() {
    const response = await super.get(PATH);
    return (response);
  }

  static async createBooking(booking) {
    const response = await super.post(PATH, booking);
    return (response);
  }

  static async updateBooking(booking) {
    const response = await this.put(PATH, booking);
    return (response);
  }

  static async deleteBookingById(id) {
    const response = await this.delete(PATH, id);
    return (response);
  }

  static async getBookingById(id) {
    const response = await this.get(`${PATH}/${id}`);
    return (response);
  }

  static getDefaultBooking() {
    return {
      bidId: 0,
      schedulersCompanyId: 0,
      sourceAddressId: 0,
      rateType: 'Hour',
      startTime: '',
      endTime: '',
      startAddressId: 0,
      endAddressId: 0,
      fee: 0,
      bookingStatus: 'New',
      invoiceNumber: 0,
      orderNumber: 0,
      ticketNumber: 0,
      notes: '',
      createdBy: [],
      createdOn: moment()
        .unix() * 1000,
      modifiedBy: [],
      modifiedOn: moment()
        .unix() * 1000,
      isArchived: 0
    };
  }
}

export default BookingService;
