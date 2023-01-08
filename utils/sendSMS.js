import axios from "axios";
import i18next from 'i18next'

const sendSMS = (contact, message, code = "+93") => {
    if (
        !process.env.SMS_HOST ||
        !process.env.SMS_PORT ||
        !process.env.SMS_USERNAME ||
        !process.env.SMS_PASSWORD
    ) {
        throw new Error(i18next.t("failed", { ns: 'messages' }));
    }

    contact = code.concat(String(contact).charAt(0) === "0" && contact.substr(1));

    const optionsQuery = new URLSearchParams({
        username: process.env.SMS_USERNAME,
        password: process.env.SMS_PASSWORD,
        port: process.env.SMS_PORT,
        phoneNumber: contact,
        message: message,
        timeout: process.env.SMS_TIMEOUT || 0,
    }).toString();

    return axios.get(`${process.env.SMS_HOST}?${optionsQuery}`);
};

export default sendSMS