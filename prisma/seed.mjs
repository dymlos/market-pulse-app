import {
  ChangeEventType,
  CsvImportStatus,
  CsvImportType,
  InsightConfidence,
  InsightStatus,
  InsightType,
  ListingStatus,
  OpportunitySeverity,
  OpportunityStatus,
  OpportunityType,
  PrismaClient,
  ProjectStatus,
  SearchSnapshotSource,
} from "../src/generated/prisma/index.js";

process.env.DATABASE_URL ??= "file:../data/market-pulse.local.db";

const prisma = new PrismaClient();

async function main() {
  await prisma.searchResultItem.deleteMany();
  await prisma.searchSnapshot.deleteMany();
  await prisma.opportunitySignal.deleteMany();
  await prisma.insight.deleteMany();
  await prisma.changeEvent.deleteMany();
  await prisma.listingMetricSnapshot.deleteMany();
  await prisma.csvImport.deleteMany();
  await prisma.trackedSearch.deleteMany();
  await prisma.competitor.deleteMany();
  await prisma.listing.deleteMany();
  await prisma.project.deleteMany();

  const project = await prisma.project.create({
    data: {
      name: "Tienda Andina Outdoor",
      slug: "tienda-andina-outdoor",
      marketplace: "mercado-libre",
      currencyCode: "ARS",
      status: ProjectStatus.ACTIVE,
      notes:
        "Proyecto demo para probar bitacora causal operativa con foco en publicaciones outdoor de alta rotacion.",
    },
  });

  const [mate, conservadora, mochila] = await Promise.all([
    prisma.listing.create({
      data: {
        projectId: project.id,
        externalId: "MLA-TERMICO-001",
        sku: "TERM-INOX-1L",
        title: "Mate termico acero inoxidable 1L pico cebador",
        status: ListingStatus.ACTIVE,
        categoryName: "Mates y termos",
        brand: "Andina",
        currentPrice: 38999,
        availableStock: 42,
        permalink: "https://articulo.mercadolibre.com.ar/MLA-TERMICO-001",
        notes: "Listing de mayor volumen y principal referencia para timeline causal.",
      },
    }),
    prisma.listing.create({
      data: {
        projectId: project.id,
        externalId: "MLA-COOLER-002",
        sku: "COOLER-24L",
        title: "Conservadora rigida 24 litros con manija reforzada",
        status: ListingStatus.ACTIVE,
        categoryName: "Camping y pesca",
        brand: "Andina",
        currentPrice: 67990,
        availableStock: 18,
        permalink: "https://articulo.mercadolibre.com.ar/MLA-COOLER-002",
        notes: "Producto sensible a precio y envio en temporada alta.",
      },
    }),
    prisma.listing.create({
      data: {
        projectId: project.id,
        externalId: "MLA-BACKPACK-003",
        sku: "MOCH-45L",
        title: "Mochila trekking 45L impermeable con cubremochila",
        status: ListingStatus.ACTIVE,
        categoryName: "Mochilas",
        brand: "Andina",
        currentPrice: 92490,
        availableStock: 11,
        permalink: "https://articulo.mercadolibre.com.ar/MLA-BACKPACK-003",
        notes: "Listing con competencia fuerte en busqueda monitoreada.",
      },
    }),
  ]);

  await prisma.listingMetricSnapshot.createMany({
    data: [
      {
        listingId: mate.id,
        snapshotDate: new Date("2026-04-08T00:00:00.000Z"),
        visits: 118,
        salesUnits: 9,
        conversionRate: 7.63,
        revenue: 323991,
        availableStock: 58,
        price: 41999,
        adSpend: 6200,
        notes: "Base previa a cambios de precio y titulo.",
      },
      {
        listingId: mate.id,
        snapshotDate: new Date("2026-04-12T00:00:00.000Z"),
        visits: 144,
        salesUnits: 13,
        conversionRate: 9.03,
        revenue: 506987,
        availableStock: 47,
        price: 39990,
        adSpend: 7400,
        notes: "Suba posterior a ajustes operativos y mayor visibilidad.",
      },
      {
        listingId: mate.id,
        snapshotDate: new Date("2026-04-18T00:00:00.000Z"),
        visits: 171,
        salesUnits: 16,
        conversionRate: 9.36,
        revenue: 623984,
        availableStock: 42,
        price: 38999,
        adSpend: 7900,
        notes: "Mejora sostenida con ads moderados.",
      },
      {
        listingId: conservadora.id,
        snapshotDate: new Date("2026-04-08T00:00:00.000Z"),
        visits: 71,
        salesUnits: 3,
        conversionRate: 4.23,
        revenue: 215970,
        availableStock: 26,
        price: 69990,
        adSpend: 1800,
        notes: "Semana estable con baja traccion organica.",
      },
      {
        listingId: conservadora.id,
        snapshotDate: new Date("2026-04-14T00:00:00.000Z"),
        visits: 79,
        salesUnits: 4,
        conversionRate: 5.06,
        revenue: 271960,
        availableStock: 22,
        price: 67990,
        adSpend: 2200,
        notes: "Recuperacion leve luego de bajar precio y mejorar envio.",
      },
      {
        listingId: conservadora.id,
        snapshotDate: new Date("2026-04-19T00:00:00.000Z"),
        visits: 83,
        salesUnits: 4,
        conversionRate: 4.81,
        revenue: 271960,
        availableStock: 18,
        price: 67990,
        adSpend: 2600,
        notes: "Sin gran salto; contexto competitivo sigue presionando.",
      },
      {
        listingId: mochila.id,
        snapshotDate: new Date("2026-04-09T00:00:00.000Z"),
        visits: 64,
        salesUnits: 2,
        conversionRate: 3.13,
        revenue: 184980,
        availableStock: 15,
        price: 94990,
        adSpend: 1500,
        notes: "Base con presencia organica irregular.",
      },
      {
        listingId: mochila.id,
        snapshotDate: new Date("2026-04-15T00:00:00.000Z"),
        visits: 70,
        salesUnits: 2,
        conversionRate: 2.86,
        revenue: 184980,
        availableStock: 13,
        price: 93990,
        adSpend: 1500,
        notes: "Menor precio sin impacto concluyente por presion competitiva.",
      },
      {
        listingId: mochila.id,
        snapshotDate: new Date("2026-04-20T00:00:00.000Z"),
        visits: 76,
        salesUnits: 3,
        conversionRate: 3.95,
        revenue: 277470,
        availableStock: 11,
        price: 92490,
        adSpend: 1900,
        notes: "Ligera mejora coincidiendo con quiebre de stock de un competidor.",
      },
    ],
  });

  await prisma.changeEvent.createMany({
    data: [
      {
        listingId: mate.id,
        occurredAt: new Date("2026-04-10T13:30:00.000Z"),
        type: ChangeEventType.PRICE_UPDATE,
        detail: "Ajuste de precio para ganar conversion sin romper margen.",
        previousValue: "41999",
        newValue: "39990",
        comment: "Se observo perdida de posicion frente a ofertas con envio full.",
        actorName: "Sofia",
        hypothesis: "Una baja moderada podia recuperar clics y conversion en top resultados.",
      },
      {
        listingId: mate.id,
        occurredAt: new Date("2026-04-11T16:10:00.000Z"),
        type: ChangeEventType.TITLE_UPDATE,
        detail: "Se agrego el atributo pico cebador al titulo principal.",
        previousValue: "Mate termico acero inoxidable 1L",
        newValue: "Mate termico acero inoxidable 1L pico cebador",
        comment: "Busqueda interna mostraba mejor respuesta con beneficio funcional visible.",
        actorName: "Sofia",
        hypothesis: "El cambio podia mejorar CTR en resultados con titulos muy parecidos.",
      },
      {
        listingId: conservadora.id,
        occurredAt: new Date("2026-04-13T15:00:00.000Z"),
        type: ChangeEventType.PRICE_UPDATE,
        detail: "Se redujo precio para cerrar brecha frente a competidores directos.",
        previousValue: "69990",
        newValue: "67990",
        comment: "Brecha de precio visible en snapshot manual de competencia.",
        actorName: "Martin",
        hypothesis: "La brecha podia estar frenando la conversion aun con visitas estables.",
      },
      {
        listingId: conservadora.id,
        occurredAt: new Date("2026-04-13T15:20:00.000Z"),
        type: ChangeEventType.SHIPPING_UPDATE,
        detail: "Se activo envio gratis en combinacion con stock disponible.",
        previousValue: "Sin envio gratis",
        newValue: "Envio gratis",
        comment: "Ajuste para mejorar comparacion visible en grilla.",
        actorName: "Martin",
        hypothesis: "La mejora podia compensar parte de la presion competitiva sin tocar mas margen.",
      },
      {
        listingId: mochila.id,
        occurredAt: new Date("2026-04-14T12:45:00.000Z"),
        type: ChangeEventType.PRICE_UPDATE,
        detail: "Baja de precio despues de una semana con poca rotacion.",
        previousValue: "94990",
        newValue: "93990",
        comment: "Se priorizo prueba rapida antes de cambiar fotos.",
        actorName: "Lucia",
        hypothesis: "Una baja leve podia ayudar, aunque sin evidencia fuerte por la competencia.",
      },
      {
        listingId: mochila.id,
        occurredAt: new Date("2026-04-18T10:15:00.000Z"),
        type: ChangeEventType.STOCK_UPDATE,
        detail: "Ingreso de reposicion y mejora de stock visible.",
        previousValue: "8",
        newValue: "15",
        comment: "La reposicion permitio sostener la publicacion activa durante el fin de semana.",
        actorName: "Lucia",
        hypothesis: "La continuidad podia capturar demanda si algun competidor quedaba sin stock.",
      },
    ],
  });

  const [matesSearch, mochilasSearch] = await Promise.all([
    prisma.trackedSearch.create({
      data: {
        projectId: project.id,
        name: "Mates termicos 1 litro",
        query: "mate termico acero inoxidable 1 litro",
        notes: "Busqueda critica para validar cambios de titulo, precio y presencia propia.",
      },
    }),
    prisma.trackedSearch.create({
      data: {
        projectId: project.id,
        name: "Mochilas trekking 45L",
        query: "mochila trekking 45 litros impermeable",
        notes: "Busqueda con mucha comparacion por precio, full y reputacion visible.",
      },
    }),
  ]);

  const [competitorNorth, competitorRuta, competitorPampa] = await Promise.all([
    prisma.competitor.create({
      data: {
        projectId: project.id,
        name: "Outdoor North",
        sellerHandle: "outdoornorth",
        marketplaceSellerId: "seller-1001",
        notes: "Competidor frecuente en termos y accesorios outdoor.",
      },
    }),
    prisma.competitor.create({
      data: {
        projectId: project.id,
        name: "Ruta Camping",
        sellerHandle: "rutacamping",
        marketplaceSellerId: "seller-2044",
        notes: "Compite fuerte en conservadoras y mochila con full activo.",
      },
    }),
    prisma.competitor.create({
      data: {
        projectId: project.id,
        name: "Pampa Gear",
        sellerHandle: "pampagear",
        marketplaceSellerId: "seller-3099",
        notes: "Suele rotar stock rapido y abrir oportunidades temporales.",
      },
    }),
  ]);

  const matesSnapshot = await prisma.searchSnapshot.create({
    data: {
      trackedSearchId: matesSearch.id,
      capturedAt: new Date("2026-04-12T14:00:00.000Z"),
      source: SearchSnapshotSource.MANUAL,
      resultsCount: 5,
      notes: "Snapshot manual despues del ajuste de precio y titulo.",
    },
  });

  const mochilasSnapshot = await prisma.searchSnapshot.create({
    data: {
      trackedSearchId: mochilasSearch.id,
      capturedAt: new Date("2026-04-19T17:30:00.000Z"),
      source: SearchSnapshotSource.MANUAL,
      resultsCount: 5,
      notes: "Snapshot luego de reposicion propia y posible quiebre de stock ajeno.",
    },
  });

  await prisma.searchResultItem.createMany({
    data: [
      {
        searchSnapshotId: matesSnapshot.id,
        position: 1,
        competitorId: competitorNorth.id,
        externalListingId: "MLA-NORTH-010",
        observedTitle: "Termo acero 1L mate cebador premium full",
        observedPrice: 40490,
        observedSellerName: "Outdoor North",
        visibleFlags: "full, envio gratis, oferta",
        isOwnListing: false,
        isSponsored: true,
        hasFreeShipping: true,
        hasFull: true,
        isCatalogListing: false,
      },
      {
        searchSnapshotId: matesSnapshot.id,
        position: 2,
        ownListingId: mate.id,
        externalListingId: mate.externalId,
        observedTitle: "Mate termico acero inoxidable 1L pico cebador",
        observedPrice: 39990,
        observedSellerName: "Tienda Andina Outdoor",
        visibleFlags: "envio gratis",
        isOwnListing: true,
        isSponsored: false,
        hasFreeShipping: true,
        hasFull: false,
        isCatalogListing: false,
        notes: "La publicacion propia subio respecto del snapshot manual anterior.",
      },
      {
        searchSnapshotId: matesSnapshot.id,
        position: 3,
        competitorId: competitorPampa.id,
        externalListingId: "MLA-PAMPA-011",
        observedTitle: "Mate termico 1L acero doble capa",
        observedPrice: 41200,
        observedSellerName: "Pampa Gear",
        visibleFlags: "full",
        isOwnListing: false,
        isSponsored: false,
        hasFreeShipping: true,
        hasFull: true,
        isCatalogListing: true,
      },
      {
        searchSnapshotId: mochilasSnapshot.id,
        position: 1,
        competitorId: competitorRuta.id,
        externalListingId: "MLA-RUTA-020",
        observedTitle: "Mochila trekking 45L reforzada con envio full",
        observedPrice: 91990,
        observedSellerName: "Ruta Camping",
        visibleFlags: "full, envio gratis",
        isOwnListing: false,
        isSponsored: true,
        hasFreeShipping: true,
        hasFull: true,
        isCatalogListing: false,
      },
      {
        searchSnapshotId: mochilasSnapshot.id,
        position: 2,
        ownListingId: mochila.id,
        externalListingId: mochila.externalId,
        observedTitle: "Mochila trekking 45L impermeable con cubremochila",
        observedPrice: 92490,
        observedSellerName: "Tienda Andina Outdoor",
        visibleFlags: "envio gratis",
        isOwnListing: true,
        isSponsored: false,
        hasFreeShipping: true,
        hasFull: false,
        isCatalogListing: false,
      },
      {
        searchSnapshotId: mochilasSnapshot.id,
        position: 3,
        competitorId: competitorPampa.id,
        externalListingId: "MLA-PAMPA-021",
        observedTitle: "Mochila de trekking 45 litros ultraliviana",
        observedPrice: 89990,
        observedSellerName: "Pampa Gear",
        visibleFlags: "sin stock visible",
        isOwnListing: false,
        isSponsored: false,
        hasFreeShipping: false,
        hasFull: false,
        isCatalogListing: false,
        notes: "El vendedor mostraba disponibilidad incierta durante el snapshot.",
      },
    ],
  });

  await prisma.csvImport.createMany({
    data: [
      {
        projectId: project.id,
        importedAt: new Date("2026-04-12T09:10:00.000Z"),
        type: CsvImportType.LISTING_METRICS,
        fileName: "metric-snapshots-abril.csv",
        status: CsvImportStatus.PROCESSED,
        totalRows: 9,
        validRows: 9,
        invalidRows: 0,
        summary: "Importacion correcta de snapshots metricos de 3 publicaciones.",
      },
      {
        projectId: project.id,
        importedAt: new Date("2026-04-19T18:05:00.000Z"),
        type: CsvImportType.SEARCH_RESULTS,
        fileName: "search-snapshots-abril.csv",
        status: CsvImportStatus.PARTIAL,
        totalRows: 8,
        validRows: 6,
        invalidRows: 2,
        summary: "Dos filas quedaron afuera por columnas incompletas de vendedor observado.",
      },
    ],
  });

  await prisma.insight.createMany({
    data: [
      {
        projectId: project.id,
        listingId: mate.id,
        type: InsightType.CHANGE_IMPACT,
        confidence: InsightConfidence.MEDIUM,
        summary:
          "La combinacion de baja de precio y ajuste de titulo coincide con una mejora probable en visitas y conversion del termo. La atribucion sigue siendo moderada porque tambien hubo mas presion publicitaria.",
        recordedAt: new Date("2026-04-18T11:00:00.000Z"),
        status: InsightStatus.NEW,
      },
      {
        projectId: project.id,
        listingId: mochila.id,
        trackedSearchId: mochilasSearch.id,
        type: InsightType.ATTRIBUTION_MIXED,
        confidence: InsightConfidence.LOW,
        summary:
          "La mejora reciente de la mochila parece de atribucion mixta: hubo baja de precio propia, reposicion de stock y posible debilitamiento competitivo en la misma ventana.",
        recordedAt: new Date("2026-04-20T19:00:00.000Z"),
        status: InsightStatus.REVIEWED,
      },
      {
        projectId: project.id,
        trackedSearchId: matesSearch.id,
        type: InsightType.COMPETITOR_CONTEXT,
        confidence: InsightConfidence.MEDIUM,
        summary:
          "Outdoor North conserva la primera posicion con combo de full + sponsored. La publicacion propia gano visibilidad, pero todavia compite contra una oferta mas agresiva en beneficios visibles.",
        recordedAt: new Date("2026-04-12T18:20:00.000Z"),
        status: InsightStatus.NEW,
      },
    ],
  });

  await prisma.opportunitySignal.createMany({
    data: [
      {
        projectId: project.id,
        listingId: mochila.id,
        trackedSearchId: mochilasSearch.id,
        type: OpportunityType.COMPETITOR_EXIT,
        severity: OpportunitySeverity.MEDIUM,
        explanation:
          "Pampa Gear aparece con disponibilidad dudosa en la busqueda de mochilas 45L. Puede haber una ventana operativa para sostener stock, revisar ads y capturar mas clics esta semana.",
        status: OpportunityStatus.NEW,
        detectedAt: new Date("2026-04-19T18:00:00.000Z"),
      },
      {
        projectId: project.id,
        listingId: conservadora.id,
        type: OpportunityType.PRICE_GAP,
        severity: OpportunitySeverity.LOW,
        explanation:
          "La brecha de precio se achico, pero la conversion sigue tibia. Conviene revisar si el siguiente cuello es reputacion visible, full o creatividades en lugar de seguir bajando precio.",
        status: OpportunityStatus.REVIEWED,
        detectedAt: new Date("2026-04-19T18:10:00.000Z"),
      },
    ],
  });

  console.log(`Seed completado para el proyecto demo "${project.name}".`);
}

main()
  .catch((error) => {
    console.error("Fallo el seed de Market Pulse.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
