"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyListener = void 0;
const uuid_1 = require("uuid");
const base_listener_1 = require("../base.listener");
const subjects_1 = require("../subjects");
const models_1 = require("../../../models");
const queue_validation_schemas_1 = require("../queue-validation-schemas");
const exception_handler_publisher_1 = require("../../publishers/exception-handler.publisher");
class CompanyListener extends base_listener_1.Listener {
    static getInstance(connection, emitter) {
        if (!this.instance) {
            this.instance = new CompanyListener(connection, emitter);
        }
        return this.instance;
    }
    constructor(connection, emitter) {
        super(connection, emitter);
        this.queueName = "payments-service";
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.emitter.on(subjects_1.Subjects.NEW_COMPANY_REGISTERED, (data, msg) => {
            console.log("Event received:", subjects_1.Subjects.NEW_COMPANY_REGISTERED);
            const isValidEventData = this.isValidEventData(data, queue_validation_schemas_1.newCompanyRegisteredValidationSchema, msg);
            console.log(isValidEventData, "isValidEventData");
            console.log(data, "data");
            if (!isValidEventData) {
                this.channel.nack(msg, false, false);
                return;
            }
            this.handleNewCompanyRegister(data, subjects_1.Subjects.NEW_COMPANY_REGISTERED, msg);
        });
        this.emitter.on(subjects_1.Subjects.COMPANY_INFO_UPDATED, (data, msg) => {
            console.log("Event received:", subjects_1.Subjects.COMPANY_INFO_UPDATED);
            const isValidEventData = this.isValidEventData(data, queue_validation_schemas_1.companyInfoUpdatedValidationSchema, msg);
            if (!isValidEventData) {
                this.channel.nack(msg, false, false);
            }
            else {
                this.handleCompanyInfoUpdatedEventCompleted(data, subjects_1.Subjects.COMPANY_INFO_UPDATED, msg);
            }
        });
    }
    handleNewCompanyRegister(data, type, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingCompany = yield models_1.Company.findOne({
                    companyId: data.companyId,
                });
                if (existingCompany) {
                    this.channel.ack(msg);
                    return;
                }
                const newCompany = models_1.Company.build({
                    companyId: data.companyId,
                    companyName: data.companyName,
                    authorizedPersonName: data.authorizedPersonName,
                    authorizedPersonSurname: data.authorizedPersonSurname,
                    authorizedPersonEmail: data.authorizedPersonEmail,
                });
                yield newCompany.save();
                this.channel.ack(msg);
            }
            catch (error) {
                this.handleErrors(type, msg, error);
            }
        });
    }
    handleCompanyInfoUpdatedEventCompleted(data, type, msg) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("data", data);
                yield models_1.Company.updateOne({ companyId: data.id }, { $set: { companyName: data.name, companyInfoStatus: "ACTIVE" } });
                this.channel.ack(msg);
            }
            catch (error) {
                // this.handleErrors(type, msg, error);
                console.log("error", error);
            }
        });
    }
    handleErrors(type, msg, error) {
        return __awaiter(this, void 0, void 0, function* () {
            new exception_handler_publisher_1.ExceptionHandlerPublisher(this.channel).publish({
                messageId: (0, uuid_1.v4)(),
                body: {
                    type,
                    destination: process.env.CONSUL_SERVICE,
                    exception: error.message,
                    body: JSON.stringify(msg),
                },
                source: "exception-handler-service",
            });
            this.channel.nack(msg, false, false);
        });
    }
}
exports.CompanyListener = CompanyListener;
