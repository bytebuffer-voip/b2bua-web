class VietnamPhoneFormatter {
    static format(phone, options = { national: true }) {
        if (typeof phone !== "string") return null;
        let digits = phone.replace(/\D/g, '');
        if (digits.startsWith('84')) {
            digits = '0' + digits.slice(2);
        } else if (digits.startsWith('0084')) {
            digits = '0' + digits.slice(4);
        } else if (digits.startsWith('0')) {
            // Already in national format
        } else if (digits.startsWith('9') || digits.startsWith('1')) {
            digits = '0' + digits;
        } else {
            return null;
        }
        if (digits.length !== 10) return null;
        if (options.national) {
            return digits.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
        } else {
            let intl = '+84 ' + digits.slice(1);
            return intl.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3');
        }
    }

}

export default VietnamPhoneFormatter;
