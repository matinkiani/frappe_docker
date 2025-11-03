/**
 * Jalali Shamsi Datepicker - Complete Rewrite
 * This script handles:
 * 1. Checking if Shamsi calendar is enabled in System Settings
 * 2. Overriding ControlDate and ControlDatetime to display/store dates correctly
 * 3. Monkey-patching frappe.format for list views and reports
 */

frappe.provide("frappe.ui.form");

// Global flag to store whether Shamsi calendar is enabled
frappe.shamsi_calendar_enabled = false;

/**
 * Convert Persian digits to Latin digits
 */
function toLatinDigits(str) {
    if (!str) return str;
    const persianNumbers = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
    const latinNumbers = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];
    let result = str.toString();
    for (let i = 0; i < 10; i++) {
        result = result.replace(persianNumbers[i], latinNumbers[i]);
    }
    return result;
}

// ============================================================================
// SECTION 1: Check System Settings and Enable Shamsi Calendar
// ============================================================================
frappe.call({
    method: "frappe.client.get",
    args: {
        doctype: "System Settings",
        name: "System Settings"
    },
    callback: function(r) {
        if (r.message && r.message.custom_enable_shamsi_jalali_calendar == 1) {
            frappe.shamsi_calendar_enabled = true;
            console.log("Shamsi Calendar is enabled");

            // Initialize the overrides after we know it's enabled
            initializeShamsiDateControls();
            monkeyPatchFrappeFormat();
        } else {
            console.log("Shamsi Calendar is disabled");
        }
    }
});

// ============================================================================
// SECTION 2: Override ControlDate and ControlDatetime
// ============================================================================
function initializeShamsiDateControls() {
    // Save original classes
    const OriginalControlDate = frappe.ui.form.ControlDate;
    const OriginalControlDatetime = frappe.ui.form.ControlDatetime;

    // ========================================================================
    // Override ControlDate
    // ========================================================================
    frappe.ui.form.ControlDate = class ShamsiControlDate extends OriginalControlDate {
        /**
         * Override set_formatted_input to display Shamsi date
         */
        set_formatted_input(value) {
            if (!frappe.shamsi_calendar_enabled || !value) {
                return super.set_formatted_input(value);
            }

            try {
                // Convert Gregorian date (YYYY-MM-DD) to Shamsi
                const parts = value.split("-");
                if (parts.length === 3) {
                    const pDate = new persianDate([
                        parseInt(parts[0]), // year
                        parseInt(parts[1]), // month
                        parseInt(parts[2])  // day
                    ]);
                    const shamsiDate = toLatinDigits(pDate.format("YYYY/MM/DD"));
                    this.$input && this.$input.val(shamsiDate);
                } else {
                    super.set_formatted_input(value);
                }
            } catch (e) {
                console.error("Error converting to Shamsi:", e);
                super.set_formatted_input(value);
            }
        }

        /**
         * Override get_value to convert Shamsi to Gregorian before saving
         */
        get_value() {
            if (!frappe.shamsi_calendar_enabled) {
                return super.get_value();
            }

            const shamsiValue = this.$input ? this.$input.val() : "";
            if (!shamsiValue) {
                return "";
            }

            try {
                // Convert Shamsi date (YYYY/MM/DD) to Gregorian (YYYY-MM-DD)
                const shamsiLatin = toLatinDigits(shamsiValue);
                const parts = shamsiLatin.split("/");
                if (parts.length === 3) {
                    const pDate = new persianDate([
                        parseInt(parts[0]), // year
                        parseInt(parts[1]), // month
                        parseInt(parts[2])  // day
                    ]);
                    return pDate.toCalendar("gregorian").format("YYYY-MM-DD");
                }
                return shamsiValue;
            } catch (e) {
                console.error("Error converting from Shamsi:", e);
                return shamsiValue;
            }
        }

        /**
         * Override make_input to attach Persian datepicker
         */
        make_input() {
            super.make_input();

            if (!frappe.shamsi_calendar_enabled) {
                return;
            }

            // Attach Persian datepicker
            const $input = $(this.input);
            if ($input.length && !$input.hasClass("has-persian-datepicker")) {
                $input.addClass("has-persian-datepicker");

                $input.persianDatepicker({
                    format: "YYYY/MM/DD",
                    position: "auto",
                    persianDigit: false,
                    autoClose: true,
                    observer: true,
                    altField: $input,
                    onSelect: (unix) => {
                        const pDate = new persianDate(unix);
                        const shamsiDate = toLatinDigits(pDate.format("YYYY/MM/DD"));
                        $input.val(shamsiDate);
                        $input.trigger("change");
                    }
                });
            }
        }
    };

    // ========================================================================
    // Override ControlDatetime
    // ========================================================================
    frappe.ui.form.ControlDatetime = class ShamsiControlDatetime extends OriginalControlDatetime {
        /**
         * Override set_formatted_input to display Shamsi datetime
         */
        set_formatted_input(value) {
            if (!frappe.shamsi_calendar_enabled || !value) {
                return super.set_formatted_input(value);
            }

            try {
                // Parse Gregorian datetime (YYYY-MM-DD HH:mm:ss)
                const dateTimeParts = value.split(" ");
                if (dateTimeParts.length === 2) {
                    const dateParts = dateTimeParts[0].split("-");
                    const timeParts = dateTimeParts[1].split(":");

                    if (dateParts.length === 3 && timeParts.length === 3) {
                        const pDate = new persianDate([
                            parseInt(dateParts[0]), // year
                            parseInt(dateParts[1]), // month
                            parseInt(dateParts[2]), // day
                            parseInt(timeParts[0]), // hour
                            parseInt(timeParts[1]), // minute
                            parseInt(timeParts[2])  // second
                        ]);
                        const shamsiDateTime = toLatinDigits(pDate.format("YYYY/MM/DD HH:mm:ss"));
                        this.$input && this.$input.val(shamsiDateTime);
                        return;
                    }
                }
                super.set_formatted_input(value);
            } catch (e) {
                console.error("Error converting datetime to Shamsi:", e);
                super.set_formatted_input(value);
            }
        }

        /**
         * Override get_value to convert Shamsi datetime to Gregorian before saving
         */
        get_value() {
            if (!frappe.shamsi_calendar_enabled) {
                return super.get_value();
            }

            const shamsiValue = this.$input ? this.$input.val() : "";
            if (!shamsiValue) {
                return "";
            }

            try {
                // Convert Shamsi datetime (YYYY/MM/DD HH:mm:ss) to Gregorian
                const shamsiLatin = toLatinDigits(shamsiValue);
                const dateTimeParts = shamsiLatin.split(" ");

                if (dateTimeParts.length === 2) {
                    const dateParts = dateTimeParts[0].split("/");
                    const timeParts = dateTimeParts[1].split(":");

                    if (dateParts.length === 3 && timeParts.length === 3) {
                        const pDate = new persianDate([
                            parseInt(dateParts[0]), // year
                            parseInt(dateParts[1]), // month
                            parseInt(dateParts[2]), // day
                            parseInt(timeParts[0]), // hour
                            parseInt(timeParts[1]), // minute
                            parseInt(timeParts[2])  // second
                        ]);
                        return pDate.toCalendar("gregorian").format("YYYY-MM-DD HH:mm:ss");
                    }
                }
                return shamsiValue;
            } catch (e) {
                console.error("Error converting datetime from Shamsi:", e);
                return shamsiValue;
            }
        }

        /**
         * Override make_input to attach Persian datepicker with time picker
         */
        make_input() {
            super.make_input();

            if (!frappe.shamsi_calendar_enabled) {
                return;
            }

            // Attach Persian datepicker with timePicker
            const $input = $(this.input);
            if ($input.length && !$input.hasClass("has-persian-datepicker")) {
                $input.addClass("has-persian-datepicker");

                $input.persianDatepicker({
                    format: "YYYY/MM/DD HH:mm:ss",
                    position: "auto",
                    persianDigit: false,
                    autoClose: true,
                    observer: true,
                    timePicker: {
                        enabled: true,
                        meridiem: {
                            enabled: false
                        }
                    },
                    altField: $input,
                    onSelect: (unix) => {
                        const pDate = new persianDate(unix);
                        const shamsiDateTime = toLatinDigits(pDate.format("YYYY/MM/DD HH:mm:ss"));
                        $input.val(shamsiDateTime);
                        $input.trigger("change");
                    }
                });
            }
        }
    };
}

// ============================================================================
// SECTION 3: Monkey-patch frappe.format for List Views and Reports
// ============================================================================
function monkeyPatchFrappeFormat() {
    // Save original frappe.format function
    const original_format = frappe.format;

    /**
     * Override frappe.format to display Shamsi dates in lists and reports
     */
    frappe.format = function(value, df, options, doc) {
        // Only process if Shamsi calendar is enabled and field is Date or Datetime
        if (!frappe.shamsi_calendar_enabled || !df || !value) {
            return original_format(value, df, options, doc);
        }

        if (df.fieldtype === "Date" || df.fieldtype === "Datetime") {
            try {
                if (df.fieldtype === "Date") {
                    // Convert Date field
                    const parts = value.split("-");
                    if (parts.length === 3) {
                        const pDate = new persianDate([
                            parseInt(parts[0]),
                            parseInt(parts[1]),
                            parseInt(parts[2])
                        ]);
                        return toLatinDigits(pDate.format("YYYY/MM/DD"));
                    }
                } else if (df.fieldtype === "Datetime") {
                    // Convert Datetime field
                    const dateTimeParts = value.split(" ");
                    if (dateTimeParts.length === 2) {
                        const dateParts = dateTimeParts[0].split("-");
                        const timeParts = dateTimeParts[1].split(":");

                        if (dateParts.length === 3 && timeParts.length === 3) {
                            const pDate = new persianDate([
                                parseInt(dateParts[0]),
                                parseInt(dateParts[1]),
                                parseInt(dateParts[2]),
                                parseInt(timeParts[0]),
                                parseInt(timeParts[1]),
                                parseInt(timeParts[2])
                            ]);
                            return toLatinDigits(pDate.format("YYYY/MM/DD HH:mm:ss"));
                        }
                    }
                }
            } catch (e) {
                console.error("Error formatting date to Shamsi:", e);
            }
        }

        // Fall back to original format for all other cases
        return original_format(value, df, options, doc);
    };
}
