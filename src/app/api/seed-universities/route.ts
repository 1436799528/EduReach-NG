import { NextResponse } from "next/server";
import { db } from "@/db";
import { universities } from "@/db/schema";
import { sql } from "drizzle-orm";

// All NUC-approved Nigerian universities
const NIGERIAN_UNIVERSITIES = [
  // === FEDERAL UNIVERSITIES ===
  { name: "Abubakar Tafawa Balewa University", shortName: "ATBU", location: "Bauchi", type: "Federal" },
  { name: "Ahmadu Bello University", shortName: "ABU", location: "Zaria, Kaduna", type: "Federal" },
  { name: "Alex Ekwueme University", shortName: "AE-FUNAI", location: "Ndufu-Alike, Ebonyi", type: "Federal" },
  { name: "Bayero University", shortName: "BUK", location: "Kano", type: "Federal" },
  { name: "Federal University of Agriculture, Abeokuta", shortName: "FUNAAB", location: "Abeokuta, Ogun", type: "Federal" },
  { name: "Federal University of Technology, Akure", shortName: "FUTA", location: "Akure, Ondo", type: "Federal" },
  { name: "Federal University of Technology, Minna", shortName: "FUTMINNA", location: "Minna, Niger", type: "Federal" },
  { name: "Federal University of Technology, Owerri", shortName: "FUTO", location: "Owerri, Imo", type: "Federal" },
  { name: "Federal University Gashua", shortName: "FUGASHUA", location: "Gashua, Yobe", type: "Federal" },
  { name: "Federal University Dutse", shortName: "FUD", location: "Dutse, Jigawa", type: "Federal" },
  { name: "Federal University Dutsin-Ma", shortName: "FUDMA", location: "Dutsin-Ma, Katsina", type: "Federal" },
  { name: "Federal University Kashere", shortName: "FUKASHERE", location: "Kashere, Gombe", type: "Federal" },
  { name: "Federal University Lafia", shortName: "FULAFIA", location: "Lafia, Nasarawa", type: "Federal" },
  { name: "Federal University Lokoja", shortName: "FULOKOJA", location: "Lokoja, Kogi", type: "Federal" },
  { name: "Federal University Otuoke", shortName: "FUOTUOKE", location: "Otuoke, Bayelsa", type: "Federal" },
  { name: "Federal University Oye-Ekiti", shortName: "FUOYE", location: "Oye-Ekiti, Ekiti", type: "Federal" },
  { name: "Federal University Wukari", shortName: "FUWUKARI", location: "Wukari, Taraba", type: "Federal" },
  { name: "Federal University Birnin Kebbi", shortName: "FUBK", location: "Birnin Kebbi, Kebbi", type: "Federal" },
  { name: "Federal University Gusau", shortName: "FUGUSAU", location: "Gusau, Zamfara", type: "Federal" },
  { name: "Joseph Sarwuan Tarka University", shortName: "JOSTUM", location: "Makurdi, Benue", type: "Federal" },
  { name: "Michael Okpara University of Agriculture", shortName: "MOUAU", location: "Umudike, Abia", type: "Federal" },
  { name: "Modibbo Adama University", shortName: "MAU", location: "Yola, Adamawa", type: "Federal" },
  { name: "National Open University of Nigeria", shortName: "NOUN", location: "Abuja", type: "Federal" },
  { name: "Nigerian Defence Academy", shortName: "NDA", location: "Kaduna", type: "Federal" },
  { name: "Nnamdi Azikiwe University", shortName: "UNIZIK", location: "Awka, Anambra", type: "Federal" },
  { name: "Obafemi Awolowo University", shortName: "OAU", location: "Ile-Ife, Osun", type: "Federal" },
  { name: "University of Abuja", shortName: "UNIABUJA", location: "Gwagwalada, FCT", type: "Federal" },
  { name: "University of Benin", shortName: "UNIBEN", location: "Benin City, Edo", type: "Federal" },
  { name: "University of Calabar", shortName: "UNICAL", location: "Calabar, Cross River", type: "Federal" },
  { name: "University of Ibadan", shortName: "UI", location: "Ibadan, Oyo", type: "Federal" },
  { name: "University of Ilorin", shortName: "UNILORIN", location: "Ilorin, Kwara", type: "Federal" },
  { name: "University of Jos", shortName: "UNIJOS", location: "Jos, Plateau", type: "Federal" },
  { name: "University of Lagos", shortName: "UNILAG", location: "Lagos", type: "Federal" },
  { name: "University of Maiduguri", shortName: "UNIMAID", location: "Maiduguri, Borno", type: "Federal" },
  { name: "University of Nigeria, Nsukka", shortName: "UNN", location: "Nsukka, Enugu", type: "Federal" },
  { name: "University of Port Harcourt", shortName: "UNIPORT", location: "Port Harcourt, Rivers", type: "Federal" },
  { name: "University of Uyo", shortName: "UNIUYO", location: "Uyo, Akwa Ibom", type: "Federal" },
  { name: "Usmanu Danfodiyo University", shortName: "UDUSOK", location: "Sokoto", type: "Federal" },
  { name: "Federal University of Petroleum Resources", shortName: "FUPRE", location: "Effurun, Delta", type: "Federal" },
  { name: "Air Force Institute of Technology", shortName: "AFIT", location: "Kaduna", type: "Federal" },
  { name: "Nigerian Army University", shortName: "NAUB", location: "Biu, Borno", type: "Federal" },
  { name: "Nigerian Maritime University", shortName: "NMU", location: "Okerenkoko, Delta", type: "Federal" },

  // === STATE UNIVERSITIES ===
  { name: "Lagos State University", shortName: "LASU", location: "Lagos", type: "State" },
  { name: "Ladoke Akintola University of Technology", shortName: "LAUTECH", location: "Ogbomoso, Oyo", type: "State" },
  { name: "Rivers State University", shortName: "RSU", location: "Port Harcourt, Rivers", type: "State" },
  { name: "Enugu State University of Technology", shortName: "ESUT", location: "Enugu", type: "State" },
  { name: "Delta State University", shortName: "DELSU", location: "Abraka, Delta", type: "State" },
  { name: "Ekiti State University", shortName: "EKSU", location: "Ado-Ekiti, Ekiti", type: "State" },
  { name: "Imo State University", shortName: "IMSU", location: "Owerri, Imo", type: "State" },
  { name: "Cross River University of Technology", shortName: "CRUTECH", location: "Calabar, Cross River", type: "State" },
  { name: "Ambrose Alli University", shortName: "AAU", location: "Ekpoma, Edo", type: "State" },
  { name: "Adekunle Ajasin University", shortName: "AAUA", location: "Akungba, Ondo", type: "State" },
  { name: "Olabisi Onabanjo University", shortName: "OOU", location: "Ago-Iwoye, Ogun", type: "State" },
  { name: "Tai Solarin University of Education", shortName: "TASUED", location: "Ijagun, Ogun", type: "State" },
  { name: "Osun State University", shortName: "UNIOSUN", location: "Osogbo, Osun", type: "State" },
  { name: "Abia State University", shortName: "ABSU", location: "Uturu, Abia", type: "State" },
  { name: "Anambra State University of Technology", shortName: "ANSU", location: "Uli, Anambra", type: "State" },
  { name: "Benue State University", shortName: "BSU", location: "Makurdi, Benue", type: "State" },
  { name: "Borno State University", shortName: "BOSU", location: "Maiduguri, Borno", type: "State" },
  { name: "Kaduna State University", shortName: "KASU", location: "Kaduna", type: "State" },
  { name: "Kano University of Science and Technology", shortName: "KUST", location: "Wudil, Kano", type: "State" },
  { name: "Kebbi State University", shortName: "KSUSTA", location: "Aliero, Kebbi", type: "State" },
  { name: "Kwara State University", shortName: "KWASU", location: "Malete, Kwara", type: "State" },
  { name: "Nasarawa State University", shortName: "NSUK", location: "Keffi, Nasarawa", type: "State" },
  { name: "Niger Delta University", shortName: "NDU", location: "Wilberforce, Bayelsa", type: "State" },
  { name: "Plateau State University", shortName: "PLASU", location: "Bokkos, Plateau", type: "State" },
  { name: "Taraba State University", shortName: "TSU", location: "Jalingo, Taraba", type: "State" },

  // === TOP PRIVATE UNIVERSITIES ===
  { name: "Covenant University", shortName: "CU", location: "Ota, Ogun", type: "Private" },
  { name: "Babcock University", shortName: "BABCOCK", location: "Ilishan-Remo, Ogun", type: "Private" },
  { name: "Landmark University", shortName: "LMU", location: "Omu-Aran, Kwara", type: "Private" },
  { name: "Afe Babalola University", shortName: "ABUAD", location: "Ado-Ekiti, Ekiti", type: "Private" },
  { name: "Bowen University", shortName: "BOWEN", location: "Iwo, Osun", type: "Private" },
  { name: "Redeemer's University", shortName: "RUN", location: "Ede, Osun", type: "Private" },
  { name: "Lead City University", shortName: "LCU", location: "Ibadan, Oyo", type: "Private" },
  { name: "Pan-Atlantic University", shortName: "PAU", location: "Lagos", type: "Private" },
  { name: "Baze University", shortName: "BAZE", location: "Abuja", type: "Private" },
  { name: "Nile University of Nigeria", shortName: "NUN", location: "Abuja", type: "Private" },
  { name: "American University of Nigeria", shortName: "AUN", location: "Yola, Adamawa", type: "Private" },
  { name: "Igbinedion University", shortName: "IUO", location: "Okada, Edo", type: "Private" },
  { name: "Benson Idahosa University", shortName: "BIU", location: "Benin City, Edo", type: "Private" },
  { name: "Caleb University", shortName: "CALEB", location: "Imota, Lagos", type: "Private" },
  { name: "Bells University of Technology", shortName: "BELLS", location: "Ota, Ogun", type: "Private" },
  { name: "Adeleke University", shortName: "ADELEKE", location: "Ede, Osun", type: "Private" },
];

export async function POST() {
  try {
    let added = 0;
    let skipped = 0;

    // Get all existing shortNames first (one query)
    const existing = await db.select({ shortName: universities.shortName }).from(universities);
    const existingSet = new Set(existing.map((e) => e.shortName));

    // Filter to only new universities
    const newUnis = NIGERIAN_UNIVERSITIES.filter(
      (u) => !existingSet.has(u.shortName)
    );

    skipped = NIGERIAN_UNIVERSITIES.length - newUnis.length;

    // Insert in batches of 20
    for (let i = 0; i < newUnis.length; i += 20) {
      const batch = newUnis.slice(i, i + 20);
      try {
        await db.insert(universities).values(
          batch.map((u) => ({
            name: u.name,
            shortName: u.shortName,
            location: u.location,
          }))
        );
        added += batch.length;
      } catch {
        // Try one by one if batch fails
        for (const uni of batch) {
          try {
            await db.insert(universities).values({
              name: uni.name,
              shortName: uni.shortName,
              location: uni.location,
            });
            added++;
          } catch {
            skipped++;
          }
        }
      }
    }

    const total = await db
      .select({ c: sql<number>`COUNT(*)::int` })
      .from(universities);

    return NextResponse.json({
      success: true,
      message: `Added ${added} universities. Skipped ${skipped} (already exist). Total: ${total[0].c}.`,
      data: { added, skipped, total: total[0].c },
    });
  } catch (error) {
    console.error("Seed universities error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to seed universities." },
      { status: 500 }
    );
  }
}
