/**
 * Generates a realistic 120-row bank statement CSV using the exact schema reported by the user:
 * Transaction_Date,Transaction_Time,Value_Date,Description,Transaction_Type,Category,Reference_ID,Debit_INR,Credit_INR,Balance_INR,Statement_Note
 */
export function generate120RowInrStatementCSV(): string {
  const headers = [
    "Transaction_Date",
    "Transaction_Time",
    "Value_Date",
    "Description",
    "Transaction_Type",
    "Category",
    "Reference_ID",
    "Debit_INR",
    "Credit_INR",
    "Balance_INR",
    "Statement_Note",
  ].join(",");

  const rows: string[] = [];
  let balance = 1150.0; // Opening balance in rupees (₹1,150)

  // 6 months: Apr 2026 to Sep 2026 (20 transactions per month = 120 rows)
  const months = [
    { year: 2026, month: 4, days: 30 },
    { year: 2026, month: 5, days: 31 },
    { year: 2026, month: 6, days: 30 },
    { year: 2026, month: 7, days: 31 },
    { year: 2026, month: 8, days: 31 },
    { year: 2026, month: 9, days: 30 },
  ];

  let txnIndex = 1;

  months.forEach((m) => {
    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const monthPrefix = `${m.year}-${pad(m.month)}`;

    interface TxnDef {
      day: number;
      time: string;
      desc: string;
      type: "UPI" | "IMPS" | "NEFT" | "POS";
      cat: string;
      debit: number;
      credit: number;
      note: string;
    }

    const monthTxns: TxnDef[] = [
      // 1. Monthly Allowance (Credit)
      {
        day: 1,
        time: "09:30:15",
        desc: "UPI/RAJESH VERMA/ALLOWANCE",
        type: "UPI",
        cat: "Income",
        debit: 0,
        credit: 6000.0,
        note: "Monthly parental allowance",
      },
      // 2. Tutoring batch credit
      {
        day: 3,
        time: "18:20:00",
        desc: "UPI/ROHIT SHARMA/COACHING",
        type: "UPI",
        cat: "Education",
        debit: 0,
        credit: 600.0,
        note: "Physics tuition fee",
      },
      // 3. Transport auto
      {
        day: 4,
        time: "11:15:22",
        desc: "UPI/AUTO RIKSHAW/JAIPUR",
        type: "UPI",
        cat: "Transport",
        debit: 50.0,
        credit: 0,
        note: "Campus commute",
      },
      // 4. Monthly Hostel Mess Rent (Debit)
      {
        day: 5,
        time: "10:00:45",
        desc: "UPI/HOSTEL MESS ACCT/RENT",
        type: "UPI",
        cat: "Rent",
        debit: 3000.0,
        credit: 0,
        note: "Monthly hostel rent and mess",
      },
      // 5. Kirana groceries
      {
        day: 6,
        time: "17:45:10",
        desc: "UPI/LOCAL KIRANA/JAIPUR",
        type: "UPI",
        cat: "Groceries",
        debit: 180.0,
        credit: 0,
        note: "Daily provisions",
      },
      // 6. Food delivery Swiggy
      {
        day: 7,
        time: "20:30:12",
        desc: "UPI/SWIGGY/ORDER_7821",
        type: "UPI",
        cat: "Food",
        debit: 220.0,
        credit: 0,
        note: "Dinner delivery",
      },
      // 7. Telecom mobile recharge
      {
        day: 9,
        time: "12:10:05",
        desc: "UPI/JIO PREPAID/9829012345",
        type: "UPI",
        cat: "Utilities",
        debit: 239.0,
        credit: 0,
        note: "Monthly data pack",
      },
      // 8. Tutoring student 2 credit
      {
        day: 11,
        time: "16:00:00",
        desc: "UPI/POOJA GUPTA/TUITION",
        type: "UPI",
        cat: "Education",
        debit: 0,
        credit: 550.0,
        note: "Math tutoring stipend",
      },
      // 9. Transport metro
      {
        day: 13,
        time: "08:45:30",
        desc: "UPI/JAIPUR METRO/TRANSIT",
        type: "UPI",
        cat: "Transport",
        debit: 40.0,
        credit: 0,
        note: "Metro card recharge",
      },
      // 10. Spotify subscription
      {
        day: 14,
        time: "00:05:10",
        desc: "UPI/SPOTIFY/SUB",
        type: "UPI",
        cat: "Entertainment",
        debit: 149.0,
        credit: 0,
        note: "Student music plan",
      },
      // 11. Quick commerce Blinkit
      {
        day: 15,
        time: "15:20:40",
        desc: "UPI/BLINKIT/GROCERY",
        type: "UPI",
        cat: "Groceries",
        debit: 160.0,
        credit: 0,
        note: "Snacks and fruit",
      },
      // 12. Food delivery Zomato
      {
        day: 17,
        time: "21:15:00",
        desc: "UPI/ZOMATO/ORDER_3310",
        type: "UPI",
        cat: "Food",
        debit: 240.0,
        credit: 0,
        note: "Campus food order",
      },
      // 13. Tutoring student 3 credit
      {
        day: 18,
        time: "19:00:00",
        desc: "UPI/AMIT VERMA/MATHS TUITION",
        type: "UPI",
        cat: "Education",
        debit: 0,
        credit: 600.0,
        note: "Maths tuition fee",
      },
      // 14. Academic bookstore
      {
        day: 19,
        time: "14:30:00",
        desc: "UPI/CAMPUS BOOKSTORE/TEXTBOOKS",
        type: "POS",
        cat: "Education",
        debit: 350.0,
        credit: 0,
        note: "Semester notes and stationery",
      },
      // 15. Electricity share
      {
        day: 20,
        time: "11:00:00",
        desc: "UPI/MESS ELECTRICITY SHARE",
        type: "UPI",
        cat: "Utilities",
        debit: 420.0,
        credit: 0,
        note: "Room electricity share",
      },
      // 16. Pharmacy healthcare
      {
        day: 21,
        time: "16:20:15",
        desc: "UPI/APOLLO PHARMACY/MEDICINES",
        type: "POS",
        cat: "Healthcare",
        debit: 180.0,
        credit: 0,
        note: "First aid and cold medicine",
      },
      // 17. Transport rapido
      {
        day: 23,
        time: "09:10:00",
        desc: "UPI/RAPIDO/BIKE TAXI",
        type: "UPI",
        cat: "Transport",
        debit: 45.0,
        credit: 0,
        note: "Lab exam commute",
      },
      // 18. Tutoring student 4 credit
      {
        day: 25,
        time: "18:45:00",
        desc: "UPI/SNEHA JOSHI/COACHING",
        type: "UPI",
        cat: "Education",
        debit: 0,
        credit: 500.0,
        note: "Weekly tutoring batch",
      },
      // 19. Supermarket provisions
      {
        day: 26,
        time: "17:00:00",
        desc: "UPI/DMART READY/JAIPUR",
        type: "UPI",
        cat: "Groceries",
        debit: 280.0,
        credit: 0,
        note: "Monthly toiletries and snacks",
      },
      // 20. Weekend cafe dining
      {
        day: 28,
        time: "19:30:00",
        desc: "UPI/INDIAN COFFEE HOUSE/DINING",
        type: "POS",
        cat: "Food",
        debit: 190.0,
        credit: 0,
        note: "Weekend campus group study",
      },
    ];

    monthTxns.forEach((tx) => {
      const dateStr = `${monthPrefix}-${pad(tx.day)}`;
      if (tx.credit > 0) {
        balance += tx.credit;
      } else {
        balance -= tx.debit;
      }

      const refId = `REF_${m.year}_${pad(m.month)}_${pad(txnIndex)}`;
      txnIndex++;

      rows.push(
        [
          dateStr,
          tx.time,
          dateStr,
          `"${tx.desc}"`,
          tx.type,
          tx.cat,
          refId,
          tx.debit > 0 ? tx.debit.toFixed(2) : "0.00",
          tx.credit > 0 ? tx.credit.toFixed(2) : "0.00",
          balance.toFixed(2),
          `"${tx.note}"`,
        ].join(",")
      );
    });
  });

  return headers + "\n" + rows.join("\n");
}
