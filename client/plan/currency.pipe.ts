import { Pipe, PipeTransform } from "@angular/core";

@Pipe({
    name: "toCurrency"
})
export class CurrencyPipe implements PipeTransform {
    transform (priceLevel: number): string {
        let currencyText = "<i class='fa fa-usd'></i>".repeat(priceLevel)
                         + "<span class='sr-only'>"
                         + "Price Level: "
                         + priceLevel
                         + "</span>";

        return currencyText;
    }
}
