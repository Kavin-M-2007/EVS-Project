import datetime
import json
import logging
from sqlalchemy.orm import Session
from database import engine, Base, SessionLocal
import models, auth

logger = logging.getLogger("ecosort.seed")

def seed_database():
    Base.metadata.create_all(bind=engine)
    db: Session = SessionLocal()

    try:
        # Check if already seeded with Coimbatore
        existing_muni = db.query(models.Municipality).filter(models.Municipality.code == "CCMC-01").first()
        if existing_muni:
            logger.info("Database already seeded with Coimbatore (Peelamedu) demonstration data.")
            return

        logger.info("Seeding EcoSort AI database with Peelamedu, Coimbatore demonstration data...")

        # Clear existing demo data to prevent stale Mumbai records
        db.query(models.SensorReading).delete()
        db.query(models.CollectionRecord).delete()
        db.query(models.CollectionTask).delete()
        db.query(models.CollectionRoute).delete()
        db.query(models.CollectionVehicle).delete()
        db.query(models.SmartBin).delete()
        db.query(models.Complaint).delete()
        db.query(models.Notification).delete()
        db.query(models.AuditLog).delete()
        db.query(models.User).delete()
        db.query(models.UserRole).delete()
        db.query(models.Municipality).delete()
        db.commit()

        # 1. Municipalities
        coimbatore = models.Municipality(
            name="Coimbatore Municipal Corporation (CCMC)",
            code="CCMC-01",
            state="Tamil Nadu",
            country="India",
            total_area_sqkm=257.0,
            population=1600000,
            contact_email="clean.coimbatore@ecosort.gov.in"
        )
        green_valley = models.Municipality(
            name="Green Valley",
            code="GV-02",
            state="Karnataka",
            country="India",
            total_area_sqkm=88.2,
            population=620000,
            contact_email="ecozone@greenvalley.gov.in"
        )
        harbor = models.Municipality(
            name="Harbor Bay",
            code="HB-03",
            state="Kerala",
            country="India",
            total_area_sqkm=110.0,
            population=480000,
            contact_email="harbor.cleantown@ecosort.gov.in"
        )
        db.add_all([coimbatore, green_valley, harbor])
        db.commit()
        db.refresh(coimbatore)
        db.refresh(green_valley)
        db.refresh(harbor)

        # 2. Roles
        roles = [
            models.UserRole(role_name="SUPER_ADMIN", description="Global platform administrator with full system authority"),
            models.UserRole(role_name="ADMIN", description="Municipal administrator managing collectors, bins, routes and operations"),
            models.UserRole(role_name="GARBAGE_COLLECTOR", description="Field personnel with mobile collection interface"),
            models.UserRole(role_name="MUNICIPALITY_MONITOR", description="Auditor and operational supervisor with read-only monitoring privileges")
        ]
        db.add_all(roles)
        db.commit()

        # 3. Seeded Users (Primary Test Accounts)
        super_admin = models.User(
            email="superadmin@ecosort.ai",
            password_hash=auth.hash_password("Admin@123"),
            full_name="Dr. Alexander Vance",
            employee_id="SA-001",
            role="SUPER_ADMIN",
            municipality_id=None,
            phone_number="+91 98422 11001",
            status="ACTIVE"
        )

        cbe_admin = models.User(
            email="admin.metro@ecosort.ai",
            password_hash=auth.hash_password("Admin@123"),
            full_name="Sarah Jenkins",
            employee_id="ADM-101",
            role="ADMIN",
            municipality_id=coimbatore.id,
            assigned_area="Peelamedu Zone - Avinashi Road",
            phone_number="+91 98422 22002",
            status="ACTIVE"
        )

        cbe_collector = models.User(
            email="collector.metro@ecosort.ai",
            password_hash=auth.hash_password("Admin@123"),
            full_name="Rajesh Sharma",
            employee_id="GC-501",
            role="GARBAGE_COLLECTOR",
            municipality_id=coimbatore.id,
            assigned_area="Peelamedu & Avinashi Road Commercial Corridor",
            phone_number="+91 98422 33003",
            status="ACTIVE"
        )

        cbe_monitor = models.User(
            email="monitor.metro@ecosort.ai",
            password_hash=auth.hash_password("Admin@123"),
            full_name="Elena Rostova",
            employee_id="MON-801",
            role="MUNICIPALITY_MONITOR",
            municipality_id=coimbatore.id,
            assigned_area="Peelamedu & East Coimbatore Zones",
            phone_number="+91 98422 44004",
            status="ACTIVE"
        )

        collector_2 = models.User(
            email="collector2.metro@ecosort.ai",
            password_hash=auth.hash_password("Admin@123"),
            full_name="Vikram Patel",
            employee_id="GC-502",
            role="GARBAGE_COLLECTOR",
            municipality_id=coimbatore.id,
            assigned_area="Hope College & TIDEL Park Route",
            phone_number="+91 98422 55005",
            status="ACTIVE"
        )

        db.add_all([super_admin, cbe_admin, cbe_collector, cbe_monitor, collector_2])
        db.commit()
        db.refresh(cbe_collector)
        db.refresh(collector_2)

        # 4. Collection Vehicles in Peelamedu, Coimbatore (TN-38 registration)
        vehicles = [
            models.CollectionVehicle(
                vehicle_code="VEH-EV-01",
                plate_number="TN-38-EV-4421",
                municipality_id=coimbatore.id,
                model="EcoCompactor 4000 EV",
                capacity_kg=4000.0,
                status="ACTIVE",
                current_lat=11.0245,
                current_lng=77.0028
            ),
            models.CollectionVehicle(
                vehicle_code="VEH-EV-02",
                plate_number="TN-38-EV-4422",
                municipality_id=coimbatore.id,
                model="EcoCompactor 4000 EV",
                capacity_kg=4000.0,
                status="ACTIVE",
                current_lat=11.0315,
                current_lng=77.0280
            ),
            models.CollectionVehicle(
                vehicle_code="VEH-EV-03",
                plate_number="TN-38-EV-4423",
                municipality_id=coimbatore.id,
                model="MicroHauler Urban 1500",
                capacity_kg=1500.0,
                status="ACTIVE",
                current_lat=11.0215,
                current_lng=76.9940
            ),
            models.CollectionVehicle(
                vehicle_code="VEH-GV-01",
                plate_number="KA-05-EV-1088",
                municipality_id=green_valley.id,
                model="EcoCompactor 4000 EV",
                capacity_kg=4000.0,
                status="ACTIVE",
                current_lat=12.9716,
                current_lng=77.5946
            ),
        ]
        db.add_all(vehicles)
        db.commit()
        db.refresh(vehicles[0])
        db.refresh(vehicles[1])

        # 5. Smart Bins with realistic coordinates in Peelamedu, Coimbatore (11.018 - 11.035 N, 76.985 - 77.045 E)
        bins_data = [
            ("BIN-MC-001", "PSG College of Technology Main Gate, Avinashi Road", 11.0245, 77.0028, "Plastic", 94.0, "CRITICAL", 88.0, 29.5, 38.4),
            ("BIN-MC-002", "Peelamedu Central Bus Shelter, Avinashi Road", 11.0260, 77.0085, "Organic", 86.5, "NEAR_FULL", 92.0, 30.2, 44.0),
            ("BIN-MC-003", "Hope College Junction South, Kamarajar Road", 11.0282, 77.0130, "Paper & Cardboard", 45.0, "NORMAL", 96.0, 28.0, 18.5),
            ("BIN-MC-004", "Fun Republic Mall Promenade, Avinashi Road", 11.0308, 77.0182, "Mixed Waste", 92.0, "CRITICAL", 79.0, 29.8, 36.0),
            ("BIN-MC-005", "TIDEL Park IT Expressway, Vilankurichi Road", 11.0315, 77.0280, "Plastic", 78.0, "NEAR_FULL", 90.0, 29.1, 29.2),
            ("BIN-MC-006", "Coimbatore Airport Terminal, Civil Aerodrome", 11.0305, 77.0430, "Metal & Cans", 34.0, "NORMAL", 98.0, 27.4, 14.8),
            ("BIN-MC-007", "PSGR Krishnammal College Gate, Avinashi Road", 11.0268, 77.0062, "Organic", 62.0, "NORMAL", 91.0, 28.5, 24.5),
            ("BIN-MC-008", "Peelamedu Railway Feeder Road, Kamarajar Road", 11.0212, 77.0075, "E-Waste Drop", 58.0, "NORMAL", 95.0, 28.2, 22.0),
            ("BIN-MC-009", "Nava India Signal Crossing, Avinashi Road", 11.0215, 76.9940, "Plastic", 91.5, "CRITICAL", 84.0, 30.0, 37.0),
            ("BIN-MC-010", "Lakshmi Mills Junction Square, Avinashi Road", 11.0182, 76.9855, "Organic", 25.0, "NORMAL", 99.0, 27.1, 11.0),
        ]

        created_bins = []
        for code, loc, lat, lng, cat, fill, st, bat, temp, wt in bins_data:
            sb = models.SmartBin(
                bin_code=code,
                municipality_id=coimbatore.id,
                location_name=loc,
                latitude=lat,
                longitude=lng,
                waste_category=cat,
                fill_level=fill,
                max_capacity_liters=240.0,
                status=st,
                battery_level=bat,
                temperature_c=temp,
                weight_kg=wt,
                last_collection_time=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=4)
            )
            created_bins.append(sb)

        db.add_all(created_bins)
        db.commit()
        for b in created_bins:
            db.refresh(b)
            # Add telemetry readings for each
            for h in range(5, -1, -1):
                reading = models.SensorReading(
                    bin_id=b.id,
                    fill_percentage=max(5.0, b.fill_level - (h * 7.5)),
                    temperature_c=b.temperature_c - (h * 0.3),
                    weight_kg=max(4.0, b.weight_kg - (h * 3.2)),
                    battery_pct=b.battery_level,
                    recorded_at=datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=h * 2)
                )
                db.add(reading)
        db.commit()

        # 6. Routes in Peelamedu, Coimbatore along Avinashi Road & TIDEL Park
        route_1 = models.CollectionRoute(
            route_code="RT-CBE-AVINASHI-01",
            name="Avinashi Road Commercial Corridor",
            municipality_id=coimbatore.id,
            distance_km=11.6,
            estimated_time_minutes=38,
            waypoints_json=json.dumps([
                {"order": 1, "bin_code": "BIN-MC-010", "location": "Lakshmi Mills Junction Square", "lat": 11.0182, "lng": 76.9855},
                {"order": 2, "bin_code": "BIN-MC-009", "location": "Nava India Signal Crossing", "lat": 11.0215, "lng": 76.9940},
                {"order": 3, "bin_code": "BIN-MC-001", "location": "PSG College of Technology Main Gate", "lat": 11.0245, "lng": 77.0028},
                {"order": 4, "bin_code": "BIN-MC-007", "location": "PSGR Krishnammal College Gate", "lat": 11.0268, "lng": 77.0062},
                {"order": 5, "bin_code": "BIN-MC-002", "location": "Peelamedu Central Bus Shelter", "lat": 11.0260, "lng": 77.0085},
                {"order": 6, "bin_code": "BIN-MC-003", "location": "Hope College Junction South", "lat": 11.0282, "lng": 77.0130},
                {"order": 7, "bin_code": "BIN-MC-004", "location": "Fun Republic Mall Promenade", "lat": 11.0308, "lng": 77.0182}
            ]),
            status="ACTIVE"
        )
        db.add(route_1)
        db.commit()
        db.refresh(route_1)

        # 7. Collection Tasks
        now = datetime.datetime.now(datetime.timezone.utc)
        t1 = models.CollectionTask(
            task_code="TASK-20261105-001",
            municipality_id=coimbatore.id,
            collector_id=cbe_collector.id,
            vehicle_id=vehicles[0].id,
            route_id=route_1.id,
            area_name="Peelamedu & Avinashi Road Commercial Corridor",
            priority="HIGH",
            status="In Progress",
            assigned_at=now - datetime.timedelta(hours=2),
            accepted_at=now - datetime.timedelta(hours=1, minutes=45),
            started_at=now - datetime.timedelta(minutes=40),
            notes="Priority pickup for overflowing bins at PSG Tech Gate and Fun Republic Mall."
        )

        t2 = models.CollectionTask(
            task_code="TASK-20261105-002",
            municipality_id=coimbatore.id,
            collector_id=cbe_collector.id,
            vehicle_id=vehicles[1].id,
            route_id=route_1.id,
            area_name="Hope College & TIDEL Park Express",
            priority="MEDIUM",
            status="Assigned",
            assigned_at=now - datetime.timedelta(minutes=30),
            notes="Scheduled afternoon collection round."
        )

        t3 = models.CollectionTask(
            task_code="TASK-20261105-003",
            municipality_id=coimbatore.id,
            collector_id=collector_2.id,
            vehicle_id=vehicles[2].id,
            route_id=None,
            area_name="Nava India & Lakshmi Mills",
            priority="LOW",
            status="Completed",
            assigned_at=now - datetime.timedelta(hours=6),
            accepted_at=now - datetime.timedelta(hours=5, minutes=50),
            started_at=now - datetime.timedelta(hours=5, minutes=30),
            completed_at=now - datetime.timedelta(hours=4),
            notes="Routine morning clearance completed along Avinashi Road."
        )

        db.add_all([t1, t2, t3])
        db.commit()

        # 8. Notifications
        notifs = [
            models.Notification(
                role_target="ALL",
                municipality_id=None,
                title="System Operational Update",
                message="EcoSort AI platform synchronized for Coimbatore Municipal Corporation (Peelamedu Zone).",
                notification_type="SYSTEM_ALERT"
            ),
            models.Notification(
                role_target="ADMIN",
                municipality_id=coimbatore.id,
                title="Urgent Bin Overflow",
                message="Smart Bin BIN-MC-001 at PSG College of Technology Main Gate reached 94% capacity.",
                notification_type="OVERFLOW_ALERT"
            ),
            models.Notification(
                user_id=cbe_collector.id,
                municipality_id=coimbatore.id,
                title="Task Assignment",
                message="You have been assigned priority task TASK-20261105-001 in Peelamedu Commercial Corridor.",
                notification_type="TASK_ASSIGNED"
            )
        ]
        db.add_all(notifs)

        # 9. Complaints
        complaints = [
            models.Complaint(
                ticket_number="ECO-TKT-8841",
                citizen_name="Pooja Kulkarni",
                citizen_phone="+91 98422 22334",
                citizen_email="pooja.k@gmail.com",
                municipality_id=coimbatore.id,
                complaint_type="Overflowing Bin",
                description="The blue plastic recycling bin near Hope College bus stop has overflowed onto the pavement.",
                location_name="Hope College Junction, Avinashi Road, Peelamedu",
                latitude=11.0282,
                longitude=77.0130,
                status="IN_PROGRESS"
            ),
            models.Complaint(
                ticket_number="ECO-TKT-9214",
                citizen_name="Amitabh Mehra",
                citizen_phone="+91 98422 33445",
                citizen_email="amehra@outlook.com",
                municipality_id=coimbatore.id,
                complaint_type="Damaged Bin Lid",
                description="Smart bin sensor solar lid damaged by falling branch during rain near Fun Republic.",
                location_name="Fun Republic Mall Promenade, Avinashi Road, Peelamedu",
                latitude=11.0308,
                longitude=77.0182,
                status="PENDING"
            )
        ]
        db.add_all(complaints)

        # 10. Audit Logs
        audits = [
            models.AuditLog(user_id=super_admin.id, user_email=super_admin.email, user_role=super_admin.role, action="SYSTEM_INITIALIZATION", details="EcoSort AI Peelamedu, Coimbatore municipal region initialized."),
            models.AuditLog(user_id=cbe_admin.id, user_email=cbe_admin.email, user_role=cbe_admin.role, action="DISPATCH_OPTIMIZATION", details="Dispatched 2 EV collection teams to Peelamedu Avinashi Corridor."),
        ]
        db.add_all(audits)

        db.commit()
        logger.info("Database successfully seeded with Peelamedu, Coimbatore demonstration data!")

    except Exception as e:
        db.rollback()
        logger.error(f"Error seeding database: {e}", exc_info=True)
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
