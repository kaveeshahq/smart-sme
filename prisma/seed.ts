import { PrismaMssql } from "@prisma/adapter-mssql";
import { PrismaClient } from "../generated/prisma";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaMssql({
  server: "localhost",
  port: 1433,
  database: "SmartSME",
  user: "sme_admin",
  password: "SmeSys@2024",
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Seeding database...");

  // ─────────────────────────────────────────
  // USERS & EMPLOYEES
  // ─────────────────────────────────────────

  const hashedPassword = await bcrypt.hash("password123", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@smartsme.lk" },
    update: {},
    create: {
      email: "admin@smartsme.lk",
      password: hashedPassword,
      role: "ADMIN",
      employee: {
        create: {
          firstName: "Kavindu",
          lastName: "Perera",
          phone: "0771234567",
          address: "45 Galle Road, Colombo 03",
          nic: "199512345678",
          department: "Management",
          position: "System Administrator",
          salary: 120000,
          hiredAt: new Date("2022-01-15"),
        },
      },
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: "manager@smartsme.lk" },
    update: {},
    create: {
      email: "manager@smartsme.lk",
      password: hashedPassword,
      role: "MANAGER",
      employee: {
        create: {
          firstName: "Dilshan",
          lastName: "Fernando",
          phone: "0779876543",
          address: "12 Kandy Road, Nugegoda",
          nic: "199023456789",
          department: "Operations",
          position: "Operations Manager",
          salary: 95000,
          hiredAt: new Date("2022-03-01"),
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "employee1@smartsme.lk" },
    update: {},
    create: {
      email: "employee1@smartsme.lk",
      password: hashedPassword,
      role: "EMPLOYEE",
      employee: {
        create: {
          firstName: "Nimasha",
          lastName: "Wickramasinghe",
          phone: "0712345678",
          address: "78 Baseline Road, Colombo 09",
          nic: "200034567890",
          department: "Sales",
          position: "Sales Executive",
          salary: 55000,
          hiredAt: new Date("2023-06-01"),
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "employee2@smartsme.lk" },
    update: {},
    create: {
      email: "employee2@smartsme.lk",
      password: hashedPassword,
      role: "EMPLOYEE",
      employee: {
        create: {
          firstName: "Tharindu",
          lastName: "Rajapaksha",
          phone: "0756789012",
          address: "23 Station Road, Kadawatha",
          nic: "199878901234",
          department: "Inventory",
          position: "Stock Controller",
          salary: 50000,
          hiredAt: new Date("2023-09-15"),
        },
      },
    },
  });

  await prisma.user.upsert({
    where: { email: "employee3@smartsme.lk" },
    update: {},
    create: {
      email: "employee3@smartsme.lk",
      password: hashedPassword,
      role: "EMPLOYEE",
      employee: {
        create: {
          firstName: "Sachini",
          lastName: "Dissanayake",
          phone: "0767890123",
          address: "56 Temple Road, Maharagama",
          nic: "200156789012",
          department: "Finance",
          position: "Accounts Assistant",
          salary: 58000,
          hiredAt: new Date("2024-01-10"),
        },
      },
    },
  });

  console.log("✅ Users & Employees created");

  // ─────────────────────────────────────────
  // CATEGORIES
  // ─────────────────────────────────────────

  const categories = await Promise.all([
    prisma.category.upsert({
      where: { name: "Electronics" },
      update: {},
      create: { name: "Electronics", description: "Electronic devices and accessories" },
    }),
    prisma.category.upsert({
      where: { name: "Stationery" },
      update: {},
      create: { name: "Stationery", description: "Office and school stationery" },
    }),
    prisma.category.upsert({
      where: { name: "Furniture" },
      update: {},
      create: { name: "Furniture", description: "Office and home furniture" },
    }),
    prisma.category.upsert({
      where: { name: "Cleaning Supplies" },
      update: {},
      create: { name: "Cleaning Supplies", description: "Cleaning and hygiene products" },
    }),
    prisma.category.upsert({
      where: { name: "Food & Beverages" },
      update: {},
      create: { name: "Food & Beverages", description: "Food items and drinks" },
    }),
    prisma.category.upsert({
      where: { name: "Tools & Hardware" },
      update: {},
      create: { name: "Tools & Hardware", description: "Tools and hardware items" },
    }),
  ]);

  console.log("✅ Categories created");

  // ─────────────────────────────────────────
  // SUPPLIERS
  // ─────────────────────────────────────────

  const suppliers = await Promise.all([
    prisma.supplier.create({
      data: {
        name: "Abans Electronics Pvt Ltd",
        contactName: "Ruwan Mendis",
        email: "supply@abans.lk",
        phone: "0112345678",
        address: "498 Galle Road",
        city: "Colombo",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Cargills Ceylon PLC",
        contactName: "Priya Seneviratne",
        email: "wholesale@cargills.lk",
        phone: "0113456789",
        address: "40 York Street",
        city: "Colombo",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Singer Sri Lanka",
        contactName: "Nimal Jayasuriya",
        email: "trade@singersl.com",
        phone: "0114567890",
        address: "Singer Tower, Union Place",
        city: "Colombo",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Printcare Stationery",
        contactName: "Amali Rodrigo",
        email: "orders@printcare.lk",
        phone: "0115678901",
        address: "15 Sir Baron Jayathilaka Mw",
        city: "Colombo",
      },
    }),
    prisma.supplier.create({
      data: {
        name: "Hemas Holdings",
        contactName: "Chamara Silva",
        email: "supply@hemas.lk",
        phone: "0116789012",
        address: "36 Bristol Street",
        city: "Colombo",
      },
    }),
  ]);

  console.log("✅ Suppliers created");

  // ─────────────────────────────────────────
  // PRODUCTS
  // ─────────────────────────────────────────

  const products = await Promise.all([
    // Electronics
    prisma.product.create({
      data: {
        name: "Samsung 32\" LED TV",
        sku: "EL-001",
        description: "Full HD LED Television",
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        costPrice: 42000,
        sellingPrice: 52000,
        stockQty: 15,
        lowStockAlert: 5,
        unit: "pcs",
      },
    }),
    prisma.product.create({
      data: {
        name: "Lenovo IdeaPad Laptop",
        sku: "EL-002",
        description: "Intel Core i5, 8GB RAM, 512GB SSD",
        categoryId: categories[0].id,
        supplierId: suppliers[2].id,
        costPrice: 115000,
        sellingPrice: 138000,
        stockQty: 8,
        lowStockAlert: 3,
        unit: "pcs",
      },
    }),
    prisma.product.create({
      data: {
        name: "HP LaserJet Printer",
        sku: "EL-003",
        description: "Monochrome laser printer",
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        costPrice: 28000,
        sellingPrice: 35000,
        stockQty: 6,
        lowStockAlert: 2,
        unit: "pcs",
      },
    }),
    prisma.product.create({
      data: {
        name: "USB-C Hub 7-in-1",
        sku: "EL-004",
        description: "Multi-port USB-C hub",
        categoryId: categories[0].id,
        supplierId: suppliers[0].id,
        costPrice: 3500,
        sellingPrice: 4800,
        stockQty: 30,
        lowStockAlert: 10,
        unit: "pcs",
      },
    }),
    // Stationery
    prisma.product.create({
      data: {
        name: "A4 Paper Ream (500 sheets)",
        sku: "ST-001",
        description: "80gsm white A4 paper",
        categoryId: categories[1].id,
        supplierId: suppliers[3].id,
        costPrice: 950,
        sellingPrice: 1250,
        stockQty: 200,
        lowStockAlert: 50,
        unit: "ream",
      },
    }),
    prisma.product.create({
      data: {
        name: "Ballpoint Pen Box (12pcs)",
        sku: "ST-002",
        description: "Blue ballpoint pens",
        categoryId: categories[1].id,
        supplierId: suppliers[3].id,
        costPrice: 180,
        sellingPrice: 280,
        stockQty: 150,
        lowStockAlert: 30,
        unit: "box",
      },
    }),
    prisma.product.create({
      data: {
        name: "Stapler Heavy Duty",
        sku: "ST-003",
        description: "Heavy duty office stapler",
        categoryId: categories[1].id,
        supplierId: suppliers[3].id,
        costPrice: 650,
        sellingPrice: 950,
        stockQty: 40,
        lowStockAlert: 10,
        unit: "pcs",
      },
    }),
    // Furniture
    prisma.product.create({
      data: {
        name: "Office Chair Ergonomic",
        sku: "FU-001",
        description: "Ergonomic mesh office chair",
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
        costPrice: 18000,
        sellingPrice: 24500,
        stockQty: 12,
        lowStockAlert: 3,
        unit: "pcs",
      },
    }),
    prisma.product.create({
      data: {
        name: "Wooden Office Desk",
        sku: "FU-002",
        description: "120cm wooden office desk",
        categoryId: categories[2].id,
        supplierId: suppliers[2].id,
        costPrice: 22000,
        sellingPrice: 29000,
        stockQty: 7,
        lowStockAlert: 2,
        unit: "pcs",
      },
    }),
    // Cleaning
    prisma.product.create({
      data: {
        name: "Floor Cleaner 5L",
        sku: "CL-001",
        description: "Multi-surface floor cleaner",
        categoryId: categories[3].id,
        supplierId: suppliers[4].id,
        costPrice: 480,
        sellingPrice: 680,
        stockQty: 80,
        lowStockAlert: 20,
        unit: "bottle",
      },
    }),
    prisma.product.create({
      data: {
        name: "Hand Sanitizer 500ml",
        sku: "CL-002",
        description: "70% alcohol hand sanitizer",
        categoryId: categories[3].id,
        supplierId: suppliers[4].id,
        costPrice: 290,
        sellingPrice: 420,
        stockQty: 6,
        lowStockAlert: 20,
        unit: "bottle",
      },
    }),
    // Food & Beverages
    prisma.product.create({
      data: {
        name: "Ceylon Tea 200g",
        sku: "FB-001",
        description: "Premium Ceylon black tea",
        categoryId: categories[4].id,
        supplierId: suppliers[1].id,
        costPrice: 380,
        sellingPrice: 520,
        stockQty: 120,
        lowStockAlert: 30,
        unit: "pack",
      },
    }),
    prisma.product.create({
      data: {
        name: "Mineral Water 1.5L (6 pack)",
        sku: "FB-002",
        description: "Pure mineral water",
        categoryId: categories[4].id,
        supplierId: suppliers[1].id,
        costPrice: 340,
        sellingPrice: 480,
        stockQty: 90,
        lowStockAlert: 20,
        unit: "pack",
      },
    }),
    // Tools
    prisma.product.create({
      data: {
        name: "Screwdriver Set 12pcs",
        sku: "TL-001",
        description: "Professional screwdriver set",
        categoryId: categories[5].id,
        supplierId: suppliers[2].id,
        costPrice: 1800,
        sellingPrice: 2500,
        stockQty: 25,
        lowStockAlert: 5,
        unit: "set",
      },
    }),
    prisma.product.create({
      data: {
        name: "Electric Drill Machine",
        sku: "TL-002",
        description: "650W electric drill",
        categoryId: categories[5].id,
        supplierId: suppliers[2].id,
        costPrice: 8500,
        sellingPrice: 11500,
        stockQty: 3,
        lowStockAlert: 3,
        unit: "pcs",
      },
    }),
  ]);

  console.log("✅ Products created");

  // ─────────────────────────────────────────
  // CUSTOMERS
  // ─────────────────────────────────────────

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        firstName: "Asanka",
        lastName: "Gunawardena",
        email: "asanka.g@gmail.com",
        phone: "0771122334",
        address: "34 Duplication Road",
        city: "Colombo",
        nic: "198812345670",
        loyaltyPts: 250,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Malini",
        lastName: "Senanayake",
        email: "malini.s@yahoo.com",
        phone: "0712233445",
        address: "67 High Level Road",
        city: "Nugegoda",
        loyaltyPts: 180,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Roshan",
        lastName: "Bandara",
        email: "roshan.b@hotmail.com",
        phone: "0723344556",
        address: "12 Peradeniya Road",
        city: "Kandy",
        loyaltyPts: 420,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Sandya",
        lastName: "Kumari",
        email: "sandya.k@gmail.com",
        phone: "0734455667",
        address: "89 Matara Road",
        city: "Galle",
        loyaltyPts: 95,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Pradeep",
        lastName: "Dharmasena",
        email: "pradeep.d@gmail.com",
        phone: "0745566778",
        address: "23 Jaffna Road",
        city: "Vavuniya",
        loyaltyPts: 310,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Chamari",
        lastName: "Athukorala",
        email: "chamari.a@gmail.com",
        phone: "0756677889",
        address: "45 Negombo Road",
        city: "Wattala",
        loyaltyPts: 150,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Nuwan",
        lastName: "Kulasekara",
        email: "nuwan.k@gmail.com",
        phone: "0767788990",
        address: "78 Baseline Road",
        city: "Colombo",
        loyaltyPts: 520,
      },
    }),
    prisma.customer.create({
      data: {
        firstName: "Ishara",
        lastName: "Madushanka",
        email: "ishara.m@gmail.com",
        phone: "0778899001",
        address: "90 Kurunegala Road",
        city: "Kurunegala",
        loyaltyPts: 75,
      },
    }),
  ]);

  console.log("✅ Customers created");

  // ─────────────────────────────────────────
  // SALES (3 months history)
  // ─────────────────────────────────────────

  const salesData = [
    {
      invoiceNo: "INV-2026-001",
      customerId: customers[0].id,
      soldAt: new Date("2026-04-02"),
      paymentMethod: "CASH",
      items: [
        { productId: products[4].id, quantity: 5, unitPrice: 1250 },
        { productId: products[5].id, quantity: 3, unitPrice: 280 },
      ],
    },
    {
      invoiceNo: "INV-2026-002",
      customerId: customers[1].id,
      soldAt: new Date("2026-04-05"),
      paymentMethod: "CARD",
      items: [
        { productId: products[0].id, quantity: 1, unitPrice: 52000 },
        { productId: products[3].id, quantity: 2, unitPrice: 4800 },
      ],
    },
    {
      invoiceNo: "INV-2026-003",
      customerId: customers[2].id,
      soldAt: new Date("2026-04-10"),
      paymentMethod: "BANK_TRANSFER",
      items: [
        { productId: products[1].id, quantity: 1, unitPrice: 138000 },
      ],
    },
    {
      invoiceNo: "INV-2026-004",
      customerId: customers[3].id,
      soldAt: new Date("2026-04-18"),
      paymentMethod: "CASH",
      items: [
        { productId: products[9].id, quantity: 4, unitPrice: 680 },
        { productId: products[10].id, quantity: 6, unitPrice: 420 },
        { productId: products[11].id, quantity: 2, unitPrice: 520 },
      ],
    },
    {
      invoiceNo: "INV-2026-005",
      customerId: customers[4].id,
      soldAt: new Date("2026-05-03"),
      paymentMethod: "CASH",
      items: [
        { productId: products[7].id, quantity: 2, unitPrice: 24500 },
        { productId: products[8].id, quantity: 1, unitPrice: 29000 },
      ],
    },
    {
      invoiceNo: "INV-2026-006",
      customerId: customers[5].id,
      soldAt: new Date("2026-05-08"),
      paymentMethod: "CARD",
      items: [
        { productId: products[13].id, quantity: 3, unitPrice: 2500 },
        { productId: products[14].id, quantity: 1, unitPrice: 11500 },
      ],
    },
    {
      invoiceNo: "INV-2026-007",
      customerId: customers[6].id,
      soldAt: new Date("2026-05-15"),
      paymentMethod: "CASH",
      items: [
        { productId: products[4].id, quantity: 10, unitPrice: 1250 },
        { productId: products[6].id, quantity: 2, unitPrice: 950 },
      ],
    },
    {
      invoiceNo: "INV-2026-008",
      customerId: customers[7].id,
      soldAt: new Date("2026-05-22"),
      paymentMethod: "CHEQUE",
      items: [
        { productId: products[2].id, quantity: 1, unitPrice: 35000 },
        { productId: products[3].id, quantity: 3, unitPrice: 4800 },
      ],
    },
    {
      invoiceNo: "INV-2026-009",
      customerId: customers[0].id,
      soldAt: new Date("2026-06-01"),
      paymentMethod: "CASH",
      items: [
        { productId: products[11].id, quantity: 5, unitPrice: 520 },
        { productId: products[12].id, quantity: 3, unitPrice: 480 },
      ],
    },
    {
      invoiceNo: "INV-2026-010",
      customerId: customers[2].id,
      soldAt: new Date("2026-06-05"),
      paymentMethod: "CARD",
      items: [
        { productId: products[7].id, quantity: 4, unitPrice: 24500 },
      ],
    },
    {
      invoiceNo: "INV-2026-011",
      customerId: customers[4].id,
      soldAt: new Date("2026-06-10"),
      paymentMethod: "BANK_TRANSFER",
      items: [
        { productId: products[1].id, quantity: 2, unitPrice: 138000 },
        { productId: products[3].id, quantity: 5, unitPrice: 4800 },
      ],
    },
    {
      invoiceNo: "INV-2026-012",
      customerId: customers[6].id,
      soldAt: new Date("2026-06-12"),
      paymentMethod: "CASH",
      items: [
        { productId: products[9].id, quantity: 8, unitPrice: 680 },
        { productId: products[10].id, quantity: 10, unitPrice: 420 },
      ],
    },
  ];

  for (const sale of salesData) {
    const subtotal = sale.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice, 0
    );
    const tax = Math.round(subtotal * 0.08);
    const total = subtotal + tax;

    await prisma.sale.create({
      data: {
        invoiceNo: sale.invoiceNo,
        customerId: sale.customerId,
        soldAt: sale.soldAt,
        paymentMethod: sale.paymentMethod,
        status: "COMPLETED",
        subtotal,
        tax,
        discount: 0,
        total,
        items: {
          create: sale.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            discount: 0,
            total: item.quantity * item.unitPrice,
          })),
        },
      },
    });
  }

  console.log("✅ Sales created");

  // ─────────────────────────────────────────
  // EXPENSES
  // ─────────────────────────────────────────

  await prisma.expense.createMany({
    data: [
      { title: "Office Rent - April", amount: 85000, category: "RENT", date: new Date("2026-04-01") },
      { title: "Electricity Bill - April", amount: 12500, category: "UTILITIES", date: new Date("2026-04-05") },
      { title: "Staff Salaries - April", amount: 378000, category: "SALARIES", date: new Date("2026-04-30") },
      { title: "Facebook Ads Campaign", amount: 15000, category: "MARKETING", date: new Date("2026-04-15") },
      { title: "Office Supplies", amount: 8500, category: "SUPPLIES", date: new Date("2026-04-20") },
      { title: "Office Rent - May", amount: 85000, category: "RENT", date: new Date("2026-05-01") },
      { title: "Electricity Bill - May", amount: 13200, category: "UTILITIES", date: new Date("2026-05-05") },
      { title: "Staff Salaries - May", amount: 378000, category: "SALARIES", date: new Date("2026-05-31") },
      { title: "Vehicle Fuel & Transport", amount: 22000, category: "TRANSPORT", date: new Date("2026-05-10") },
      { title: "AC Maintenance", amount: 9500, category: "MAINTENANCE", date: new Date("2026-05-20") },
      { title: "Office Rent - June", amount: 85000, category: "RENT", date: new Date("2026-06-01") },
      { title: "Electricity Bill - June", amount: 11800, category: "UTILITIES", date: new Date("2026-06-05") },
      { title: "Staff Salaries - June", amount: 378000, category: "SALARIES", date: new Date("2026-06-30") },
      { title: "Google Ads", amount: 18000, category: "MARKETING", date: new Date("2026-06-08") },
      { title: "Internet & Phone Bills", amount: 7500, category: "UTILITIES", date: new Date("2026-06-10") },
    ],
  });

  console.log("✅ Expenses created");

  // ─────────────────────────────────────────
  // ATTENDANCE (last 7 days)
  // ─────────────────────────────────────────

  const employees = await prisma.employee.findMany();
  const today = new Date();

  for (let i = 6; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue; // skip weekends

    for (const emp of employees) {
      const statuses = ["PRESENT", "PRESENT", "PRESENT", "PRESENT", "LATE", "ABSENT"];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      await prisma.attendance.create({
        data: {
          employeeId: emp.id,
          date,
          checkIn: status !== "ABSENT" ? new Date(date.setHours(8, 30, 0)) : null,
          checkOut: status !== "ABSENT" ? new Date(date.setHours(17, 30, 0)) : null,
          status,
        },
      });
    }
  }

  console.log("✅ Attendance created");

  console.log("\n🎉 Database seeded successfully!");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("📧 Admin:    admin@smartsme.lk");
  console.log("📧 Manager:  manager@smartsme.lk");
  console.log("📧 Employee: employee1@smartsme.lk");
  console.log("🔑 Password: password123");
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });