MISSION PROFILE: EPIC SYSTEMS
CERTIFICATION AUDIT
(PRELUDE/GRAND CENTRAL)
1. Architectural Foundations: The Chronicles
Database and the Facility Structure
The pursuit of proficiency or certification in Epic Systems’ access applications—specifically
Prelude (Enterprise Registration), Eligibility (Real-Time Eligibility), and Grand Central
(Enterprise Admission-Discharge-Transfer)—requires a cognitive shift from the perspective of
an end-user to that of a systems architect. To understand how a patient flows from a scheduled
appointment to an inpatient bed, and finally to a discharged financial record, one must first
deconstruct the proprietary database environment that underpins every transaction: Chronicles.
Chronicles is Epic’s real-time, hierarchical database management system (DBMS), evolved from
the MUMPS (Massachusetts General Hospital Utility Multi-Programming System) language.
Unlike the relational databases (RDBMS) prevalent in general IT, which utilize tables, rows, and
columns connected by foreign keys, Chronicles utilizes a tree-based structure optimized for the
high-volume, transactional nature of healthcare. This distinction is not merely academic; it
fundamentally dictates how an analyst builds records, how the system retrieves data for
eligibility checks, and how bed availability is calculated in real-time.
1.1 The Anatomy of Data: Master Files, Records, and Contacts
The candidate preparing for a proficiency exam must internalize the taxonomy of Chronicles, as
exam questions frequently hinge on identifying the correct data level for a specific setting.
Chronicles Concept Analogy Technical Definition Examples in Access
Modules
Master File (INI) File Cabinet Drawer A database storing all
data of a specific type.
Identified by a
3-character "INI"
.
EPT (Patient), EAR
(Guarantor), BED
(Bed), HSP (Hospital
Account), EPM (Payor).
Record File Folder A specific entity within
a Master File, identified
by a unique Record ID
(.1 Item).
Patient "John Doe"
,
Payor "Aetna"
, Bed "3
West-01"
.
Contact Sheet of Paper A snapshot of data
valid for a specific
instant or period.
An Admission Event,
An Address Change, A
Benefit Verification
Response.
Item Form Question A discrete field
definition (Data Type,
Add Type).
Date of Birth, Social
Security Number, Bed
Status.
Chronicles Concept Analogy Technical Definition Examples in Access
Modules
Value Written Answer The specific data
entered into an item.
"01/01/1980"
,
"Dirty"
.
"Active"
,
1.1.1 Static vs. Dynamic Master Files
A critical architectural distinction for the Prelude/Grand Central builder is the volatility of the
master file.
●
Static (Administrative) Master Files: These define the rules of the road. They are built
by analysts, undergo rigorous change control, and are migrated between environments
(e.g., from POC to TST to PRD) using Data Courier. Examples include the Payor (EPM),
Plan (EPP), Department (DEP), and Room (ROM) master files.
●
Dynamic (Transactional) Master Files: These are the records created by the operation
of the hospital. They grow continuously and are never migrated via Data Courier, as doing
so would overwrite actual patient data. Examples include Patient (EPT), Guarantor (EAR),
and Hospital Account (HSP).
This distinction is vital for the certification project. A candidate will be tasked with building the
"Static" infrastructure (a new hospital wing, a new insurance plan) to support the "Dynamic"
workflows (admitting a patient, verifying coverage).
1.2 The Facility Structure and Inheritance Logic
Configuration in Epic is rarely done at the user level. Instead, it is attached to the Facility
Structure, a hierarchy of records that represent the organization’s physical and logical layout.
The power of this structure lies in Inheritance and the Rule of Specificity: a setting configured
at a lower, more specific level overrides a setting at a higher, more general level.
The hierarchy relevant to Grand Central and Prelude is as follows, from general to specific:
1. Facility (EAF): The highest level, representing the entire enterprise. Global settings, such
as the default "System Definitions" (LSD), are linked here.
2. Service Area (EAF): Represents a distinct business entity or Accounts Receivable (AR)
region. Guarantor accounts are typically scoped to the Service Area, allowing a single
patient to have different financial profiles for different hospital affiliates.
3. Revenue Location (EAF): Represents a physical building or a cluster of departments
(e.g.,
"Main Campus Hospital"). Address information and specific National Provider
Identifiers (NPIs) often live here.
4. Department (DEP): The fundamental unit where work occurs. This is the primary login
context. A user logs into "3 West Nursing Unit,
" and inherits the settings of that
department.
5. Room (ROM): A Grand Central-specific record grouping beds.
6. Bed (BED): The atomic unit of census.
The Certification Trap: A common exam scenario describes a setting configured at the Service
Area level and a contradictory setting at the Department level. The candidate must identify that
the Department level setting prevails due to the Rule of Specificity. Conversely, if a setting is
missing at the Department level, the system "looks up" the tree to the Location, then Service
Area, then Facility to find a value.
2. Prelude (Enterprise Registration): Identity and
Financial Clearance
Prelude is the gatekeeper. Its primary mandates are Identity Management (establishing the
"Golden Record") and Financial Clearance (ensuring a billable pathway exists). It is the module
where the Patient (EPT) and Guarantor (EAR) master files are heavily manipulated.
2.1 The Architecture of Liability: Guarantor Accounts (EAR)
While the Patient (EPT) record represents the clinical human being, the Guarantor (EAR)
record represents the financial entity responsible for the "Self-Pay" portion of the bill.
Understanding the distinction between Patient, Guarantor, and Subscriber is a prerequisite for
proficiency.
●
●
●
●
●
Patient: The recipient of care.
Subscriber: The policyholder of the insurance.
Guarantor: The person or entity who pays the remaining balance.
In the Prelude build, the Account (EAR) master file is complex. It supports multiple Account
Types, which dictate how the billing system (Resolute) handles the debt.
Personal/Family: The most common type. The patient (or parent) is the guarantor.
Third Party Liability (TPL): Used for accidents (auto, tort) where an external entity is
liable.
●
●
Workers' Compensation: Linked to employment-related injuries.
Research: Used to segregate costs covered by a study grant.
Build Logic: The system uses Guarantor Creation Rules to automate this. For example, when
a registrar selects a "Visit Type" of "Work Injury,
" the Workflow Engine Rule can force the
creation of a Workers' Comp guarantor account, preventing the commingling of personal and
employment-related debt on a single statement.
2.2 The Payor-Plan-Benefit Structure
Coverage in Epic is not a single text field; it is a relational triad of three static master files and
one dynamic link.
1. Payor (EPM): The insurance company (e.g., Aetna).
2. Plan (EPP): The specific product (e.g., Aetna HMO).
3. Benefits (CVG): The dynamic record attached to the patient that links them to the EPP.
The Visit Filing Order (VFO): A patient may have multiple active coverages (e.g., Medicare
and a private supplement). Prelude uses a Filing Order Calculator to determine precedence.
This is governed by regulations (e.g., Medicare Secondary Payer rules). The build involves
configuring these rules in the System Definitions or Payor records. The VFO ensures that
when a Hospital Account (HAR) is created, the claims are sent in the correct sequence. If the
VFO is incorrect, the claim will be denied instantly.
2.3 Duplicate Prevention Logic
One of Prelude's most critical technical functions is preventing the creation of duplicate EPT
records, which creates clinical safety risks. This is handled by Identity Management logic.
●
Weighted Matching: The system assigns numerical weights to data points (SSN = High
Weight, Phone Number = Medium Weight).
●
●
Thresholds: Analysts configure a "Threshold Score.
" If a new registration exceeds this
score against an existing record, a "Potential Duplicate" warning appears.
Hard Stops: For the certification project, candidates often must configure a "Hard Stop"
workflow, preventing a user from bypassing the duplicate check without a manager’s
override.
3. Eligibility (RTE) and the Payer Platform
Real-Time Eligibility (RTE) automates the verification of the coverage data entered in Prelude. It
moves data from the "Unverified" state to "Verified" without human intervention.
3.1 The RTE Interface Architecture
RTE operates via Epic Bridges, the interface engine. It utilizes the ANSI X12 standard
transactions:
●
270 Inquiry: An outbound message asking,
"Is Patient X covered by Plan Y?"
●
271 Response: The inbound answer from the payer or clearinghouse.
For the modern builder, this architecture is increasingly being supplemented or replaced by the
Epic Payer Platform (EPP). EPP is a direct, API-based connection between the provider's Epic
instance and the payer's system, bypassing traditional clearinghouses. This reduces latency
and cost while increasing data fidelity.
3.2 Interface Profiles and Variable Mapping
The brain of the RTE build is the Interface Profile. This record controls the logic of the query.
●
Trigger Events: The profile defines when a query is sent. Common triggers include
"Appointment Created,
" "Admission,
" "Pre-Registration,
" and "Nightly Batch.
"
●
Search Logic: It defines what data is sent. For example, if the patient has no Subscriber
ID, should the system send a query based on SSN and DOB? This "Search Option" is
configured here.
Snippet Insight: As noted in , configurations in the Interface Profile (variables like
MC
270
FILTER
INACTIVE
_
_
_
_
MEMBERS) allow for granular control, such as suppressing
inactive coverage responses to declutter the user interface.
3.3 Component Groups (CMGs) and Benefit Mapping
The 271 response contains raw data (e.g.,
"Co-pay: $20"). The system must map this text to a
discrete field in Epic to trigger "Point of Service" (POS) collection prompts. This is done via
Component Groups (CMGs).
Technical Nuance: Integrated vs. Non-Integrated CMGs There is a fundamental architectural
decision in RTE build:
1. Integrated CMGs: The same component groups are used for both RTE Display and
Backend Adjudication (Claims). This is required if using Riders (add-on benefits). It
ensures that the benefits quoted at registration match exactly what the claims engine
calculates. However, it is complex to build and maintain.
2. Non-Integrated CMGs: Separate groups are built solely for display. This is simpler and
allows for "User Friendly" grouping (e.g., grouping all "Physical Therapy" codes into one
line item), but introduces the risk of discrepancy between the quote and the bill.
Certification Pathway: A proficient analyst must be able to troubleshoot a "Mapping Error.
" If a
271 returns a benefit code that is not mapped to a CMG, the data will sit in "Raw Data" and not
file into the patient's record. The fix involves analyzing the RTE Response Report, identifying
the unmapped EB code (Eligibility Benefit), and adding it to the appropriate category in the
Benefits Engine.
4. Grand Central (ADT): The Engine of Patient Flow
Grand Central is the operational core of the hospital. It translates the clinical decision to "Admit"
into the logistical reality of Bed Planning, Transport, and Environmental Services.
4.1 Bed and Room Master Files (BED/ROM)
In Grand Central, the physical hospital is digitized.
●
Room (ROM): Contains attributes regarding the physical space. Key configurations
include Privacy (Private vs. Semi-Private), Negative Pressure (for Isolation), and
Gender Restrictions.
●
Bed (BED): The capacity unit. The Bed record holds the Status (Available, Occupied,
Housekeeping, Held).
Build Detail: When building a new unit for the certification project, the candidate does not just
"add a bed.
" They must:
1. Create the Department (DEP).
2. Create Rooms (ROM) linked to that Department.
3. Create Beds (BED) linked to those Rooms.
4. Configure Bed Logic to determine if a patient can be placed there. For example,
"Overflow" logic might allow a Med/Surg patient to be placed in an ICU bed if the census
is capped.
4.2 The Admission Workflow and Pending Status
The transition from "Outpatient" to "Inpatient" involves a complex state change.
●
●
The Trigger: A physician places an "Admission Order" (ORD).
The Pending Record: This order creates a Pending Admission in the Grand Central
system. It does not occupy a bed yet.
●
Bed Planning: The "Bed Planner" (a specialized user role) views a workqueue of
Pending Admissions. They assign a specific bed based on Level of Care (LOC) and
Service.
Technical Trap: A common issue occurs when a patient is in the ED (Emergency Department).
They technically have an active "ED Visit" (HOV). When the Admission Order is signed, the
system must determine whether to Discharge the ED visit and create a new Inpatient
admission, or Update the existing visit to Inpatient. This is controlled by Event Management
logic and is crucial for the "Three Day Window" billing rule compliance.
4.3 Environmental Services (EVS) and Sectors
Grand Central automates the "Dirty Bed" cycle.
●
Trigger: When a patient is Discharged or Transferred, the bed status automatically flips to
"Housekeeping.
"
●
Sectors: The hospital is divided into Sectors (groups of rooms). EVS staff are assigned
to sectors.
●
Logic: The system assigns the cleaning job based on the sector. If the patient had an
"Isolation" indicator (e.g., C. Diff), the EVS job is flagged as "Isolation Clean,
" requiring
specific protocols.
●
Rover Integration: The job is pushed to the Rover mobile app on the EVS staff's device.
When they mark "Complete" in Rover, the bed status in Grand Central instantly flips to
"Available,
" alerting the Bed Planner.
Configuration Note: The integration with EVS often involves a specific XML configuration file
(pluginproperties.xml) on the integration server to handle email and web service messaging
between Epic and the EVS dispatch system (e.g., Vocera), ensuring real-time status updates.
4.4 Transport Command Center
Similar to EVS, Transport is managed via a Command Center.
●
●
Auto-Dispatching: Analysts can configure logic to auto-assign transport jobs.
Logic:
○
●
Proximity: Assign the job to the transporter physically closest to the patient (using
Wi-Fi triangulation or last scanned location).
○
○
Priority: STAT requests override Routine requests.
Mode: Ensure a transporter with a "Stretcher" capability is not assigned a
"Wheelchair" job.
Turnaround Time (TAT): The build includes defining TAT goals (e.g.,
"Pickup within 15
minutes"). Breaching these goals triggers escalation alerts on the Command Center
dashboard.
5. The Nervous System: Workflow Engine Rules (WER)
and Logic
If Chronicles is the skeleton and Master Files are the organs, the Workflow Engine is the
nervous system. It detects context and dictates behavior.
5.1 CER vs. LOR: The Logic Distinction
Candidates often confuse CER and LOR.
●
CER (Criteria): These are the logical building blocks. A CER rule evaluates to True/False
or a specific value.
○
Example: Patient Age < 18 (True/False).
○
Example: Primary Payor = Medicare (True/False).
●
LOR (Workflow Engine Rule): This is the master rule that uses CER criteria to make
decisions about the user interface.
○
Structure: IF IS TRUE, THEN SET [Navigator = Pediatric Admission].
Build Context: In Grand Central, the LOR determines which Navigator a nurse sees when
admitting a patient.
●
If Context = Admission AND Service = Obstetrics, the LOR directs the system to load the
"Labor & Delivery Admission Navigator.
"
●
If Context = Discharge AND Disposition = SNF, the LOR loads the "Discharge to Facility
Navigator" (which requires specific forms like the MOT).
The proficiency exam requires the candidate to read a LOR hierarchy and predict which
navigator will appear for a specific patient scenario.
5.2 SmartTools and Dynamic Documentation
Within the workflows dictated by the WER, SmartTools provide dynamic content.
●
SmartLinks: Pull data from the database into a note or instruction.
○
@FNAME@ pulls the patient's First Name.
○
@BED@ pulls the current Bed label.
●
●
SmartTexts: Standardized templates.
SmartLists: Dropdown choices.
Technical Integration: A powerful build technique involves embedding a CER rule inside a
SmartText. For example, a discharge instruction SmartText can use a CER rule to check IF
Smoking Status = Current Smoker, and if True, automatically drop in the "Smoking Cessation"
educational paragraph. This is "Conditional SmartText Logic"
.
6. Integration and Ripple Effects
A siloed understanding of Grand Central/Prelude is insufficient for certification. One must
understand the ripple effects.
6.1 The ADT-Resolute Interface
Every ADT event triggers a message to Resolute Hospital Billing (HB).
●
Accommodation Codes: Grand Central tracks the patient's location (e.g., ICU). The
"Accommodation Code" attached to the Room/Bed master file determines the nightly
room charge (e.g.,
"ICU Room Charge - Level 1").
●
Patient Class Changes: Changing a patient from "Observation" to "Inpatient" changes
the billing methodology from Hourly to DRG-based. The ADT system must capture the
precise timestamp of this order to ensure compliant billing.
●
Harvesting: At discharge, Resolute "Harvests" the ADT data to initiate the claim. If the
Prelude "Filing Order" or Grand Central "Accommodation Code" is wrong, the claim fails.
6.2 The ADT-Clinical Interface
●
●
Orders: Admission is driven by Orders. The "Admission Bed Request" order in EpicCare
(Clinical) triggers the "Bed Request" in Grand Central. The mapping between the Order
selection (e.g.,
"Admit to ICU") and the Grand Central attributes (Level of Care = ICU) is a
critical build point.
Medication Administration: If a patient is transferred from "Unit A" to "Unit B,
" the
system must determine whether to "Hold" or "Continue" active medication orders. This is
controlled by Order Reconciliation settings linked to the Transfer workflow.
7. The Certification and Proficiency Pathway
Navigating the educational bureaucracy of Epic is as complex as the software itself.
7.1 Certification vs. Proficiency
●
●
Certification:
○
Prerequisite: Employment by an Epic customer or approved consulting firm.
Sponsorship is mandatory.
○
Training: Requires travel to Epic HQ in Verona, WI (or virtual attendance) for
multi-day courses (e.g., ADT 101, ADT 102).
○
Assessment: Proctored Exam + Graded Project.
○
Status: The "Gold Standard.
" Portable and highly marketable.
Proficiency:
○
Prerequisite: Access to the Epic UserWeb (usually granted to all client
employees).
○
Training: Self-study using the "Training Companion" materials. No class
attendance required.
○
○
Assessment: Proctored Exam + Graded Project.
Status: "Proficient.
" Indicates knowledge but lacks the formal credential. Often a
stepping stone to sponsorship.
"Proficiency with Honors" is awarded for high exam
scores.
7.2 The Project: Building a Hospital
The barrier to entry is the Project. It is not a multiple-choice quiz; it is a build simulation.
●
Scope: You will likely be asked to build a "Mini-Hospital" in the training environment
(Sup/Support environment).
●
Tasks:
1. Facility Structure: Create a new Location and Department.
2. Bed Build: Create Rooms and Beds with specific privacy/gender logic.
3. Navigator Build: Create a custom Admission Navigator that includes a specific,
non-standard form.
4. Rule Build: Create a Workflow Engine Rule (LOR) that triggers this navigator only
for patients with a specific "Chief Complaint.
"
5. RTE Mapping: Map a raw 271 response code to a specific Epic benefit category.
●
Evaluation: Epic staff will log into your build environment and attempt to "break" your
build. They will try to admit a male patient to a female-only room you built. If it works, you
fail. Hard stops must function as Hard Stops.
7.3 Exam Strategy
●
●
Open Book: The exams are open book (UserWeb/Galaxy access allowed). However, the
time limit (usually 2 hours for 50-60 questions) precludes looking up every answer.
System Lookup: Questions will ask,
"Open Record EPT 5543. What is the value of the
'Sex' item?" You must know how to use Record Viewer or Chronicles (Text) to find the
●
answer quickly.
Scenario-Based: "Nurse Jane is trying to transfer Patient Doe but sees error X. Which
security key is she missing?" This requires understanding Security Classes (ECL) and
user templates.
8. Conclusion: The Integrated Architect
The mastery of Epic’s Grand Central, Prelude, and Eligibility modules is not merely an exercise
in memorizing three-letter acronyms (INIs). It is an exercise in understanding the interconnected
flow of healthcare operations. The Proficiency candidate must recognize that a decision made in
the Payor Master File (EPM) in Prelude dictates the financial viability of a Hospital Account
(HAR) created in Grand Central, which in turn drives the Bed Planning logic that assigns a
patient to a physical Bed (BED).
The successful architect sees beyond the "Admit" button. They see the Workflow Engine Rule
that selected the navigator, the Identity Management algorithm that verified the patient, the
RTE Interface Profile that cleared the finances, and the Event Management logic that bundled
the charges. It is this depth of vision—the ability to see the Chronicles database beneath the
Hyperspace veneer—that distinguishes the certified expert from the casual user.
Appendix: Master File (INI) Technical Reference
INI Master File Name Module Static/Dynamic Function
EPT Patient Shared Dynamic Clinical/Demograp
hic Data. The
"Who"
.
EAR Guarantor Prelude Dynamic Financial Entity.
The "Payer of Last
Resort"
.
HSP Hospital Account GC/Resolute Dynamic Billing Bucket for a
specific encounter.
CVG Coverage Prelude Dynamic Patient's link to
insurance.
EPM Payor Prelude Static The Insurance
Company
definition.
EPP Plan Prelude Static The specific
insurance product.
BED Bed Grand Central Static Census Unit.
Linked to Room.
ROM Room Grand Central Static Physical grouping
of beds.
DEP Department Shared Static Login context and
unit definition.
LGL BPA Criteria Shared Static Logic for
BestPractice
Advisories.
LOR Workflow Engine Shared Static "The Brain"
-
INI Master File Name Module Static/Dynamic Function
Rule controls
Navigators/Activiti
es.
LVN Navigator Shared Static The "Table of
Contents" for a
workflow.
VCN Visit Nav Config Shared Static Configuration for
Navigator
behavior.
ECL Security Class Shared Static Permissions/Acces
s Rights.
EMP User Shared Dynamic The person
logging in.
(End of Report)
Works cited
1. Master Files - Connect Care Builders, https://builders.connect-care.ca/Resources/master-files
2. EPIC EHR System Architecture Tutorial | PDF | Databases | Electronic Health Record,
https://www.scribd.com/document/901853935/EPIC-EHR-System-Architecture-Tutorial 3.
Chronicles versus Caché : r/epicsystems - Reddit,
https://www.reddit.com/r/epicsystems/comments/4bqvx0/chronicles
versus
cach%C3%A9/ 4.
_
_
The Road To Epic Certification: Why Should You Do It? - UoPeople,
https://www.uopeople.edu/blog/epic-certification/ 5. Chronicles in Epic: Understanding Master
Files, Records, Contacts, and Print Groups | Exams Nursing | Docsity,
https://www.docsity.com/en/docs/epic-cln251-252-exam-100-correct-answers/11076514/ 6. Epic
Prelude Exam Questions with Complete Verified Solutions 2024/2025 - Docsity,
https://www.docsity.com/en/docs/epic-prelude-exam-questions-with-complete-verified-solutions-
20242025/11661461/ 7. account - EHI Export Specification,
https://open.epic.com/EHITables/GetTable/ACCOUNT.htm 8. UHP REGISTRATION MANUAL
(HPH EPIC),
https://uhphawaii.org/wp-content/uploads/2020/10/UHP-REGISTRATION-MANUAL-HPH-EPIC-
20201001.pdf 9. Epic Prelude: Smarter Patient Registration - Mindbowser,
https://www.mindbowser.com/understanding-epic-prelude/ 10. Epic Systems modules | Epic
Prelude | ADT | - YouTube, https://www.youtube.com/watch?v=p1Fm0UTqDVA 11. Epic Payer
Platform (EPP) for Health Care Providers - Aetna,
https://www.aetna.com/health-care-professionals/epic-payer-platform.html 12. Epic Payer
Platform Support & Staffing | EPP Implementation Experts,
https://healthtechresourcesinc.com/epic-payer-platform 13. No More Guesswork: Real-Time
Eligibility Done Right in Epic ...,
https://canopiicollaborative.com/no-more-guesswork-real-time-eligibility-done-right-in-epic-tapest
ry/ 14. Unlocking Efficiency: How Automation Is Transforming the Revenue Cycle - EpicShare,
https://www.epicshare.org/share-and-learn/automation-is-transforming-the-revenue-cycle 15.
Revenue Cycle Optimization: Epic Real Time Eligibility Integration - The HCI Group,
https://blog.thehcigroup.com/revenue-cycle-optimization-epic-real-time-eligibility-integration 16.
EHI Export Specification - Epic,
https://open.epic.com/EHITables/GetTable/PRIORITY
AUDIT
_
_
TRL.htm 17. Unit Manager | UI
Health Care Epic Education - The University of Iowa,
https://epicsupport.sites.uiowa.edu/epic-resources/unit-manager 18. GC100 Grand Central
Exam Prelude Fundamentals With Latest Solutions 2024 - Docsity,
https://www.docsity.com/en/docs/gc100-grand-central-exam-prelude-fundamentals-with-latest-s
olutions-2024/14377803/ 19. ATC Inpatient/Admission Workflows | UI Health Care Epic
Education - The University of Iowa,
https://epicsupport.sites.uiowa.edu/epic-resources/atc-inpatientadmission-workflows 20.
Hospital Patient Flow - Epic, https://www.epic.com/software/hospital-patient-flow/ 21.
Environmental Services (EVS) | UI Health Care Epic Education - The University of Iowa,
https://epicsupport.sites.uiowa.edu/epic-resources/environmental-services-evs 22. Configuring
the Epic-EVS Integration,
https://pubs.vocera.com/evs/evs
_
1.1.1/help/evs
_
config_
help/topics/evs
_
config_plugin
_propertie
s.html 23. Transport List : r/EpicEMR - Reddit,
https://www.reddit.com/r/EpicEMR/comments/1nzwit2/transport
_
list/ 24. open.epic :: Developer
Resources, https://open.epic.com/DeveloperResources 25. ChatGPT knows Epic build!? :
r/healthIT - Reddit,
https://www.reddit.com/r/healthIT/comments/119rd7c/chatgpt
knows
_
_
epic
_
build/ 26. Epic
Smartlink 101: Everything You Need to Know - Surety Systems,
https://www.suretysystems.com/insights/epic-smartlink-101-everything-you-need-to-know/ 27.
Epic Consulting Guide: Overview of Core Epic EHR Modules - ReMedi Health Solutions,
https://www.remedihs.com/epic-consulting-guide-epic-ehr-modules/ 28. How to Become Epic
Certified and Why You Should Do It - The HCI Group,
https://blog.thehcigroup.com/how-to-become-epic-certified-and-why 29. Epic Certification vs.
Proficiency Question : r/healthIT - Reddit,
https://www.reddit.com/r/healthIT/comments/sq2qpo/epic
certification
vs
_
_
_proficiency_question/
30. How To Get Epic Certified; Epic Systems Certification and Proficiency - Healthcare IT Skills,
https://healthcareitskills.com/how-to-get-epic-certified/
