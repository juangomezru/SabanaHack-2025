from datetime import datetime
import uuid
import xml.etree.ElementTree as ET


NS = {
    "cbc": "urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2",
    "cac": "urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2",
    "ext": "urn:oasis:names:specification:ubl:schema:xsd:CommonExtensionComponents-2",
    "": "urn:oasis:names:specification:ubl:schema:xsd:Invoice-2",
    "sts": "dian:gov:co:facturaelectronica:Structures-2-1",
    "ds": "http://www.w3.org/2000/09/xmldsig#",
}

# Register namespaces to get proper prefixes in output
for prefix, uri in NS.items():
    if prefix == "":
        ET.register_namespace("", uri)
    else:
        ET.register_namespace(prefix, uri)


def _sub(parent, qname: str, text: str | None = None, attrib: dict | None = None):
    elem = ET.SubElement(parent, qname, attrib or {})
    if text is not None:
        elem.text = text
    return elem


def build_ubl_invoice(
    *,
    invoice_id: str,
    profile_execution_id: str,
    currency: str,
    issue_date: datetime,
    payment_due_date: str | None,
    tax_rate: float,
    supplier: dict,
    client: dict,
    items: list[dict],
    authorization: dict,
) -> tuple[str, str, str]:
    """
    Build a UBL 2.1 XML string. Returns (xml_string, cufe, qrcode_url).

    supplier / client structure expected:
      {
        "name": str, "registrationName": str,
        "documentType": str, "documentNumber": str,
        "countryCode": str, "cityName": str | None,
        "countrySubentity": str | None, "postalZone": str | None,
        "email": str | None, "telephone": str | None,
      }

    items: { description, quantity, unitCode, price }
    authorization: { prefix, from, to, startDate, endDate, authorizationNumber }
    """

    inv_ns = f"{{{NS['']}}}"
    cbc = f"{{{NS['cbc']}}}"
    cac = f"{{{NS['cac']}}}"
    ext = f"{{{NS['ext']}}}"
    sts = f"{{{NS['sts']}}}"
    ds = f"{{{NS['ds']}}}"

    root = ET.Element(inv_ns + "Invoice")

    # UBLExtensions (DIAN)
    ubl_exts = _sub(root, ext + "UBLExtensions")
    ubl_ext = _sub(ubl_exts, ext + "UBLExtension")
    ext_content = _sub(ubl_ext, ext + "ExtensionContent")
    dian_ext = _sub(ext_content, sts + "DianExtensions")
    inv_ctrl = _sub(dian_ext, sts + "InvoiceControl")
    auth_period = _sub(inv_ctrl, sts + "AuthorizationPeriod")
    _sub(auth_period, cbc + "StartDate", authorization["startDate"])  # YYYY-MM-DD
    _sub(auth_period, cbc + "EndDate", authorization["endDate"])      # YYYY-MM-DD
    auth_invoices = _sub(inv_ctrl, sts + "AuthorizedInvoices")
    _sub(auth_invoices, sts + "Prefix", authorization["prefix"])
    _sub(auth_invoices, sts + "From", str(authorization["from"]))
    _sub(auth_invoices, sts + "To", str(authorization["to"]))
    _sub(dian_ext, sts + "InvoiceAuthorization", authorization["authorizationNumber"])  # Resolución

    # CUFE and QR placeholders
    cufe_value = uuid.uuid4().hex
    qrcode_url = f"https://catalogo-vpfe.dian.gov.co/document/searchqr?documentKey={authorization['prefix']}{invoice_id}-{issue_date.year}"
    _sub(dian_ext, sts + "QRCode", qrcode_url)

    # Signature container (placeholder only)
    ubl_ext2 = _sub(ubl_exts, ext + "UBLExtension")
    ext_content2 = _sub(ubl_ext2, ext + "ExtensionContent")
    signature = _sub(ext_content2, ds + "Signature")
    signed_info = _sub(signature, ds + "SignedInfo")
    _sub(signed_info, ds + "CanonicalizationMethod", None, {"Algorithm": "http://www.w3.org/TR/2001/REC-xml-c14n-20010315"})
    _sub(signed_info, ds + "SignatureMethod", None, {"Algorithm": "http://www.w3.org/2001/04/xmldsig-more#rsa-sha256"})
    _sub(signature, ds + "SignatureValue", "FAKE_SIGNATURE_SAMPLE_BASE64")
    # Optional KeyInfo placeholder (to mirror provided example)
    key_info = _sub(signature, ds + "KeyInfo")
    key_val = _sub(key_info, ds + "KeyValue")
    rsa = _sub(key_val, ds + "RSAKeyValue")
    _sub(rsa, ds + "Modulus", "FAKE")
    _sub(rsa, ds + "Exponent", "AQAB")

    # Header
    _sub(root, cbc + "UBLVersionID", "UBL 2.1")
    _sub(root, cbc + "CustomizationID", "DIAN 2.1: Factura Electrónica de Venta")
    _sub(root, cbc + "ProfileExecutionID", profile_execution_id)
    _sub(root, cbc + "ID", f"{authorization['prefix']}{invoice_id}")
    _sub(root, cbc + "UUID", cufe_value, {"schemeID": "2", "schemeName": "CUFE-SHA384"})
    _sub(root, cbc + "IssueDate", issue_date.strftime("%Y-%m-%d"))
    _sub(root, cbc + "IssueTime", issue_date.strftime("%H:%M:%S-05:00"))
    _sub(root, cbc + "InvoiceTypeCode", "01")
    _sub(root, cbc + "DocumentCurrencyCode", currency)

    # Supplier (AccountingSupplierParty)
    sup_party = _sub(root, cac + "AccountingSupplierParty")
    sup_p = _sub(sup_party, cac + "Party")
    _sub(_sub(sup_p, cac + "PartyName"), cbc + "Name", supplier["name"])
    sup_tax = _sub(sup_p, cac + "PartyTaxScheme")
    _sub(sup_tax, cbc + "RegistrationName", supplier["registrationName"]) 
    _sub(
        sup_tax,
        cbc + "CompanyID",
        supplier["documentNumber"],
        {"schemeAgencyID": "195", "schemeID": supplier["documentType"]},
    )
    tax_scheme = _sub(sup_tax, cac + "TaxScheme")
    _sub(tax_scheme, cbc + "ID", "01")
    _sub(tax_scheme, cbc + "Name", "IVA")
    # Optional address
    phys_loc = _sub(sup_p, cac + "PhysicalLocation")
    addr = _sub(phys_loc, cac + "Address")
    if supplier.get("cityName"):
        _sub(addr, cbc + "CityName", supplier["cityName"])
    if supplier.get("countrySubentity"):
        _sub(addr, cbc + "CountrySubentity", supplier["countrySubentity"])
    if supplier.get("postalZone"):
        _sub(addr, cbc + "PostalZone", supplier["postalZone"])
    ctry = _sub(addr, cac + "Country")
    _sub(ctry, cbc + "IdentificationCode", supplier.get("countryCode", "CO"))

    # Customer (AccountingCustomerParty)
    cust_party = _sub(root, cac + "AccountingCustomerParty")
    cust_p = _sub(cust_party, cac + "Party")
    _sub(_sub(cust_p, cac + "PartyName"), cbc + "Name", client["name"])
    cust_tax = _sub(cust_p, cac + "PartyTaxScheme")
    _sub(cust_tax, cbc + "RegistrationName", client["registrationName"]) 
    _sub(
        cust_tax,
        cbc + "CompanyID",
        client["documentNumber"],
        {"schemeAgencyID": "195", "schemeID": client["documentType"]},
    )
    cust_ts = _sub(cust_tax, cac + "TaxScheme")
    _sub(cust_ts, cbc + "ID", "01")
    _sub(cust_ts, cbc + "Name", "IVA")
    # Optional contact
    if client.get("email") or client.get("telephone"):
        contact = _sub(cust_p, cac + "Contact")
        if client.get("email"):
            _sub(contact, cbc + "ElectronicMail", client["email"])
        if client.get("telephone"):
            _sub(contact, cbc + "Telephone", client["telephone"])

    # Payment Means
    pay_means = _sub(root, cac + "PaymentMeans")
    _sub(pay_means, cbc + "ID", "1")
    _sub(pay_means, cbc + "PaymentMeansCode", "10")
    if payment_due_date:
        _sub(pay_means, cbc + "PaymentDueDate", payment_due_date)

    # Lines and totals
    subtotal = 0.0
    for idx, item in enumerate(items, start=1):
        qty = float(item.get("quantity", 1))
        unit_price = float(item.get("price", 0.0))
        line_amount = qty * unit_price
        subtotal += line_amount

        inv_line = _sub(root, cac + "InvoiceLine")
        _sub(inv_line, cbc + "ID", str(idx))
        _sub(inv_line, cbc + "InvoicedQuantity", str(qty), {"unitCode": item.get("unitCode", "NIU")})
        _sub(inv_line, cbc + "LineExtensionAmount", f"{line_amount:.2f}", {"currencyID": currency})
        _sub(_sub(inv_line, cac + "Item"), cbc + "Description", item.get("description", ""))
        price = _sub(inv_line, cac + "Price")
        _sub(price, cbc + "PriceAmount", f"{unit_price:.2f}", {"currencyID": currency})

    tax_exclusive = subtotal
    tax_amount = round(tax_exclusive * tax_rate, 2)
    tax_inclusive = tax_exclusive + tax_amount
    payable = tax_inclusive

    legal_total = _sub(root, cac + "LegalMonetaryTotal")
    _sub(legal_total, cbc + "LineExtensionAmount", f"{tax_exclusive:.2f}", {"currencyID": currency})
    _sub(legal_total, cbc + "TaxExclusiveAmount", f"{tax_exclusive:.2f}", {"currencyID": currency})
    _sub(legal_total, cbc + "TaxInclusiveAmount", f"{tax_inclusive:.2f}", {"currencyID": currency})
    _sub(legal_total, cbc + "PayableAmount", f"{payable:.2f}", {"currencyID": currency})

    # Serialize
    xml_bytes = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    return xml_bytes.decode("utf-8"), cufe_value, qrcode_url


