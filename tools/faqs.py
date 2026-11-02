# Edit the questions here, then run: python3 tools/inject_faqs.py
# It replaces the FAQ section and FAQPage schema on each page (safe to re-run).
# FAQ content for grandmoor.ca. Every answer uses only facts the owner confirmed
# (Nov 1, 2026) or that already appear on the site.

CALC = '<a href="/rate-calculator">rate calculator</a>'
CONTACT = '<a href="/contact">contact us</a>'

MIN = ("Is there a minimum number of pallets?",
       f"No. There is no minimum pallet count, so you can store a single pallet or several hundred. Pricing is tiered by volume, which means your per-pallet rate depends on how many pallets you store. Use our {CALC} to get your rate by email in a few minutes.")
LEAD = ("How much notice do you need for inbound and outbound shipments?",
        "We need just 8 hours' notice for both inbound receiving and outbound shipments. Let us know what is arriving or leaving and when, and our team schedules the dock time so your freight is not left waiting.")
HACCP = ("Is Grandmoor a food-grade warehouse?",
         "Yes. Grandmoor is a HACCP-certified warehouse, and the majority of our customers are food and beverage businesses. Our storage areas are ambient temperature-controlled, so product does not sit in an uninsulated space.")
GOODS = ("What types of products do you accept?",
         "We accept all types of goods except hazardous materials. Most of our customers are food and beverage companies, and we also store and handle products for importers, distributors and e-commerce brands across the GTA.")
CONTRACT = ("Is there a minimum contract length?",
            "No. There is no minimum contract length for storage or 3PL services. The only exception is our first-month-free promotion, which requires a minimum six-month agreement.")
CONTRACT_SHORT = ("Do I have to sign a long-term contract?",
                  "No. Grandmoor has no minimum contract length, so you can scale up, scale down or leave as your needs change. Our first-month-free promotion is the only arrangement that requires a minimum six-month term.")
WHERE = ("Where is the warehouse and when is it open?",
         "Our 27,000 sq ft facility is at 3500 Ridgeway Drive, Mississauga, ON L5L 0A2, with direct access to Highways 401, 403, 407 and the QEW and minutes from Toronto Pearson. We are open Monday to Saturday, 9 a.m. to 6 p.m.")

FAQS = {
  'index.html': [
    ("What does Grandmoor do?",
     "Grandmoor is a HACCP-certified third-party logistics (3PL) warehouse in Mississauga. We offer pallet storage, contract warehousing, e-commerce order fulfillment, cross-docking, container destuffing and inventory management for businesses across the Greater Toronto Area, with most of our customers in food and beverage."),
    MIN, LEAD, GOODS, CONTRACT, WHERE,
  ],
  'pallet-storage/index.html': [
    MIN,
    ("How is pallet storage priced?",
     f"Pallet storage is priced per pallet, with tiered rates based on how many pallets you store. Tell our {CALC} how many pallets you have and we email you a rate sheet straight away."),
    LEAD, HACCP,
    ("Can I get the first month free?",
     "New customers can get their first month of pallet storage free for up to 50 pallets. The offer requires a minimum six-month agreement. Outside of that promotion, there is no minimum contract length."),
    GOODS,
  ],
  '3pl-warehousing/index.html': [
    ("What is a 3PL warehouse?",
     "A third-party logistics (3PL) warehouse stores, manages and ships inventory on behalf of other businesses. Instead of leasing and staffing your own building, you use Grandmoor's Mississauga facility, team and processes, and pay only for the space and services you use."),
    MIN, LEAD, HACCP, GOODS, CONTRACT,
  ],
  'contract-warehousing/index.html': [
    ("What is contract warehousing?",
     "Contract warehousing gives you dedicated warehouse space and handling in someone else's facility, without signing a commercial lease or hiring warehouse staff. Grandmoor provides the building, racking, docks and team in Mississauga, and you pay for the space and services you use."),
    CONTRACT, MIN, LEAD, HACCP, GOODS,
  ],
  'order-fulfillment/index.html': [
    ("How fast are orders dispatched?",
     "Orders are worked toward same-day or next-day dispatch from our Mississauga facility, which sits on the highway network that connects to carriers serving the GTA and Ontario."),
    ("Which carriers do you work with?",
     "We coordinate with your preferred carriers, or arrange carriers ourselves, so each outbound shipment goes out on the right service level for the order."),
    ("Can you use our own packaging?",
     "Yes. Packaging can be adapted to your brand and product requirements instead of a one-size-fits-all box."),
    HACCP, GOODS, CONTRACT_SHORT,
  ],
  'cross-docking/index.html': [
    ("What is cross-docking?",
     "Cross-docking moves freight straight from an inbound truck to an outbound truck with little or no time in storage. It cuts handling, storage cost and delivery time for shipments that just need to change trucks or be split by destination."),
    LEAD,
    ("How many dock doors does the facility have?",
     "Our Mississauga facility has six dock doors, so inbound and outbound trailers can be worked at the same time without bottlenecking each other."),
    HACCP, GOODS, CONTRACT_SHORT,
  ],
  'container-destuffing/index.html': [
    ("What is container destuffing?",
     "Container destuffing is unloading goods from a shipping container, then sorting, inspecting and staging them for storage or onward delivery. Fast destuffing helps importers avoid demurrage and detention charges on containers waiting to be emptied."),
    LEAD,
    ("What happens to the goods after the container is unloaded?",
     "Goods are sorted and inspected on receipt so damage or shortages are caught early, then staged for whatever comes next: pallet storage, cross-docking or outbound distribution, all on site in Mississauga."),
    HACCP, GOODS, CONTRACT_SHORT,
  ],
  'inventory-management/index.html': [
    ("How do you track inventory?",
     "Every SKU is tracked individually, with regular cycle counts and stock audits to catch discrepancies early. Mixed pallets and partial shipments are tracked at SKU level, so your counts stay accurate after receiving day."),
    ("How often will I get inventory reports?",
     "Reporting is set to match how closely you need to watch stock: daily, weekly or on demand. We also flag low stock so you have time to reorder before a SKU runs out."),
    LEAD, HACCP, GOODS, CONTRACT_SHORT,
  ],
  'facility/index.html': [
    HACCP,
    ("What are the facility specifications?",
     "The facility is 27,000 sq ft with six dock doors, 24 ft clear height for high-density palletized racking, and ambient temperature-controlled storage areas throughout."),
    LEAD, GOODS, WHERE,
  ],
  'warehousing-mississauga/index.html': [
    ("Where is Grandmoor's Mississauga warehouse?",
     "We are at 3500 Ridgeway Drive, Mississauga, ON L5L 0A2. Most Mississauga business and industrial areas are typically under 20 minutes away, with direct access to Highways 401, 403, 407 and the QEW."),
    MIN, LEAD, HACCP, GOODS, CONTRACT_SHORT,
  ],
  'warehousing-toronto/index.html': [
    ("How far is the warehouse from downtown Toronto?",
     "Our Mississauga facility is typically under 45 minutes from downtown Toronto via the Gardiner Expressway or Highway 401, with direct QEW access for southwest Toronto. Drive times vary with traffic and your exact location."),
    HACCP, MIN, LEAD, GOODS, CONTRACT_SHORT,
  ],
  'warehousing-brampton/index.html': [
    ("How far is the warehouse from Brampton?",
     "Our Mississauga facility is typically 25 to 35 minutes from central Brampton via Highway 407 or 410, with direct access to Highway 401. Drive times vary with traffic and your exact location in Brampton."),
    MIN, LEAD, HACCP, GOODS, CONTRACT_SHORT,
  ],
  'warehousing-etobicoke/index.html': [
    ("How far is the warehouse from Etobicoke?",
     "Our Mississauga facility is typically 15 to 25 minutes from most of Etobicoke via Highway 427 or the QEW, close to the Queensway and South Etobicoke industrial areas. Drive times vary with traffic."),
    HACCP, MIN, LEAD, GOODS, CONTRACT_SHORT,
  ],
}
