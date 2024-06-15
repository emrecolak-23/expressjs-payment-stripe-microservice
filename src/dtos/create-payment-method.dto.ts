export interface CreatePaymentMethodDto {
    cardHolderName: string,
    cardNumber: string, 
    expireYear: string,
    expireMonth: string,
    cvc: string,
    customerId: number,
    orderId: string,
}