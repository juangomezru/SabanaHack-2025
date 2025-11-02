from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import relationship

from database import Base


class Client(Base):
    __tablename__ = "clients"

    id = Column(Integer, primary_key=True, index=True)
    registration_name = Column(String(255), nullable=False)
    name = Column(String(255), nullable=False)
    document_type = Column(String(10), nullable=False)  # DIAN schemeID (e.g., 13)
    document_number = Column(String(50), nullable=False)
    email = Column(String(255), nullable=True)
    telephone = Column(String(50), nullable=True)
    direccion = Column(String(255), nullable=True) 
    city_name = Column(String(100), nullable=True)
    country_subentity = Column(String(50), nullable=True)  # Departamento code
    postal_zone = Column(String(20), nullable=True)
    country_code = Column(String(5), nullable=True, default="CO")

    created_at = Column(DateTime, default=datetime.utcnow)

    invoices = relationship("Invoice", back_populates="client")


class Invoice(Base):
    __tablename__ = "invoices"

    id = Column(Integer, primary_key=True, index=True)
    invoice_id = Column(String(50), nullable=False, unique=True)  # e.g., PN1001
    currency = Column(String(3), nullable=False, default="COP")
    issue_date = Column(DateTime, default=datetime.utcnow)

    # Amounts
    line_extension_amount = Column(Float, nullable=False)
    tax_exclusive_amount = Column(Float, nullable=False)
    tax_inclusive_amount = Column(Float, nullable=False)
    payable_amount = Column(Float, nullable=False)
    tax_rate = Column(Float, nullable=False, default=0.19)

    # XML-related
    cufe = Column(String(128), nullable=True)
    qrcode_url = Column(Text, nullable=True)
    xml_content = Column(Text, nullable=True)

    client_id = Column(Integer, ForeignKey("clients.id"), nullable=False)
    client = relationship("Client", back_populates="invoices")

    created_at = Column(DateTime, default=datetime.utcnow)


