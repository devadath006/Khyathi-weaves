import { useMemo, useState } from 'react'

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen']
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety']

function twoDigits(n) {
  if (n < 20) return ONES[n]
  return TENS[Math.floor(n / 10)] + (n % 10 ? ' ' + ONES[n % 10] : '')
}
function threeDigits(n) {
  if (n >= 100) return ONES[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + twoDigits(n % 100) : '')
  return twoDigits(n)
}
function convert(n) {
  if (n === 0) return 'Zero'
  let parts = []
  const crore = Math.floor(n / 10000000)
  n %= 10000000
  const lakh = Math.floor(n / 100000)
  n %= 100000
  const thousand = Math.floor(n / 1000)
  n %= 1000
  const hundred = n
  if (crore) parts.push(threeDigits(crore) + ' Crore')
  if (lakh) parts.push(threeDigits(lakh) + ' Lakh')
  if (thousand) parts.push(threeDigits(thousand) + ' Thousand')
  if (hundred) parts.push(threeDigits(hundred))
  return parts.join(' ')
}
function numberToWordsINR(amount) {
  amount = Math.round((amount || 0) * 100) / 100
  const rupees = Math.floor(amount)
  const paise = Math.round((amount - rupees) * 100)
  let words = convert(rupees) + ' Rupees'
  if (paise > 0) words += ' and ' + convert(paise) + ' Paise'
  words += ' Only'
  return words
}

function gstCalcRow(item) {
  const taxable = Math.max((item.qty || 0) * (item.rate || 0) - (item.discount || 0), 0)
  const tax = taxable * ((item.gstpct || 0) / 100)
  return { taxable, cgst: tax / 2, sgst: tax / 2 }
}

const emptyItemForm = { desc: '', hsn: '', qty: '', unit: 'Nos', rate: '', discount: '0', gstpct: '5' }

export default function GstInvoice() {
  const [meta, setMeta] = useState({ invoiceNo: 'KW-25-26/0001', invoiceDate: '', placeOfSupply: 'Kerala (32)', reverseCharge: 'No' })
  const [metaForm, setMetaForm] = useState({ invoiceNo: '', invoiceDate: '', placeOfSupply: '', reverseCharge: 'No' })

  const [seller, setSeller] = useState({ name: 'Khyathi Weaves', address: 'Kerala - India', gstin: '', email: 'khyathiweaves@gmail.com' })
  const [sellerForm, setSellerForm] = useState({ name: '', address: '', gstin: '', email: '' })

  const [buyer, setBuyer] = useState({ name: '', address: '', gstin: '', state: '', pin: '', phone: '', email: '' })
  const [buyerForm, setBuyerForm] = useState({ name: '', address: '', gstin: '', state: '', pin: '', phone: '', email: '' })

  const [payment, setPayment] = useState({ upi: '', bank: '', acname: 'KHYATHI WEAVES', acno: '', ifsc: '', branch: '' })
  const [paymentForm, setPaymentForm] = useState({ upi: '', bank: '', acname: 'KHYATHI WEAVES', acno: '', ifsc: '', branch: '' })

  const [items, setItems] = useState([
    { desc: 'Pure Kanchi Cotton Saree (with Blouse Piece)', hsn: '5208', qty: 1, unit: 'Nos', rate: 1800, discount: 0, gstpct: 5 },
  ])
  const [itemForm, setItemForm] = useState(emptyItemForm)

  const dateDisplay = meta.invoiceDate ? new Date(meta.invoiceDate).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')

  const totals = useMemo(() => {
    let totalTaxable = 0,
      totalCgst = 0,
      totalSgst = 0
    items.forEach((item) => {
      const { taxable, cgst, sgst } = gstCalcRow(item)
      totalTaxable += taxable
      totalCgst += cgst
      totalSgst += sgst
    })
    return { totalTaxable, totalCgst, totalSgst, grandTotal: totalTaxable + totalCgst + totalSgst }
  }, [items])

  function addGstItem() {
    const qty = parseFloat(itemForm.qty) || 0
    const rate = parseFloat(itemForm.rate) || 0
    if (!itemForm.desc || qty <= 0 || rate <= 0) return
    setItems((prev) => [
      ...prev,
      {
        desc: itemForm.desc,
        hsn: itemForm.hsn,
        qty,
        unit: itemForm.unit || 'Nos',
        rate,
        discount: parseFloat(itemForm.discount) || 0,
        gstpct: parseFloat(itemForm.gstpct) || 0,
      },
    ])
    setItemForm(emptyItemForm)
  }

  function deleteGstItem(idx) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  function updateGstMeta() {
    setMeta((prev) => ({
      invoiceNo: metaForm.invoiceNo || prev.invoiceNo,
      invoiceDate: metaForm.invoiceDate || prev.invoiceDate,
      placeOfSupply: metaForm.placeOfSupply || prev.placeOfSupply,
      reverseCharge: metaForm.reverseCharge,
    }))
  }

  function updateGstSeller() {
    setSeller((prev) => ({
      name: sellerForm.name || prev.name,
      address: sellerForm.address || prev.address,
      gstin: sellerForm.gstin,
      email: sellerForm.email || prev.email,
    }))
  }

  function updateGstBuyer() {
    setBuyer({ ...buyerForm })
  }

  function updateGstPayment() {
    setPayment({ ...paymentForm, acname: paymentForm.acname || 'KHYATHI WEAVES' })
  }

  function downloadGstPDF() {
    if (!window.html2pdf) return
    window
      .html2pdf()
      .set({
        margin: 8,
        filename: 'Khyathi_Weaves_GST_Invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.5, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(document.getElementById('kw-print-gst'))
      .save()
  }

  function printGst() {
    document.body.classList.add('kw-printing-gst')
    window.print()
    setTimeout(() => document.body.classList.remove('kw-printing-gst'), 0)
  }

  return (
    <div className="gst-wrap">
      <div id="kw-print-gst" className="gst-container">
        <div className="invoice-header">
          <img className="invoice-logo" src="/assets/logo.png" alt="Logo" />
          <div className="invoice-contact">
            www.khyathiweaves.in
            <br />
            +91 9446994852
          </div>
        </div>
        <div className="invoice-title" style={{ fontSize: 15, letterSpacing: '.05em', marginBottom: 4 }}>
          WEAVES OF PURE TRADITION
        </div>
        <div className="invoice-title">GST TAX INVOICE</div>

        <table className="gst-topmeta">
          <tbody>
            <tr>
              <td className="gst-label">Invoice No.</td>
              <td>{meta.invoiceNo}</td>
              <td className="gst-label">Place of Supply</td>
              <td>{meta.placeOfSupply}</td>
            </tr>
            <tr>
              <td className="gst-label">Invoice Date</td>
              <td>{dateDisplay}</td>
              <td className="gst-label">Reverse Charge</td>
              <td>{meta.reverseCharge}</td>
            </tr>
          </tbody>
        </table>

        <div className="gst-parties">
          <div className="gst-party-box">
            <h4>Seller (Bill From)</h4>
            <div>{seller.name}</div>
            <div>{seller.address}</div>
            <div>GSTIN: {seller.gstin || '—'}</div>
            <div>{seller.email}</div>
          </div>
          <div className="gst-party-box">
            <h4>Bill To (Customer Details)</h4>
            <div>Name: {buyer.name || '—'}</div>
            <div>Address: {buyer.address || '—'}</div>
            <div>GSTIN: {buyer.gstin || '—'}</div>
            <div>
              State: {buyer.state || '—'} &nbsp; PIN: {buyer.pin || '—'}
            </div>
            <div>Phone: {buyer.phone || '—'}</div>
            <div>Email: {buyer.email || '—'}</div>
          </div>
        </div>

        <table className="gst-items-table">
          <thead>
            <tr>
              <th>Sl.</th>
              <th>Description of Goods</th>
              <th>HSN/SAC</th>
              <th>Qty</th>
              <th>Unit</th>
              <th>Rate (₹)</th>
              <th>Discount (₹)</th>
              <th>Taxable Value (₹)</th>
              <th>GST %</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={10} style={{ textAlign: 'center', color: 'var(--muted)', border: '1px solid var(--gold)' }}>
                  No items added yet.
                </td>
              </tr>
            ) : (
              items.map((item, idx) => {
                const { taxable } = gstCalcRow(item)
                return (
                  <tr key={idx}>
                    <td>{idx + 1}</td>
                    <td>{item.desc || '—'}</td>
                    <td>{item.hsn || '—'}</td>
                    <td className="num">{item.qty || 0}</td>
                    <td>{item.unit || 'Nos'}</td>
                    <td className="num">{(item.rate || 0).toFixed(2)}</td>
                    <td className="num">{(item.discount || 0).toFixed(2)}</td>
                    <td className="num">{taxable.toFixed(2)}</td>
                    <td className="num">{item.gstpct || 0}%</td>
                    <td className="gst-del-cell">
                      <button className="btn btn-danger btn-sm" title="Delete item" onClick={() => deleteGstItem(idx)}>
                        <i className="fa-solid fa-trash"></i>
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>

        <div className="gst-totals-block">
          <table className="gst-totals-table">
            <tbody>
              <tr>
                <td>Total Taxable Value</td>
                <td className="gst-tval">₹ {totals.totalTaxable.toFixed(2)}</td>
              </tr>
              <tr>
                <td>CGST</td>
                <td className="gst-tval">₹ {totals.totalCgst.toFixed(2)}</td>
              </tr>
              <tr>
                <td>SGST</td>
                <td className="gst-tval">₹ {totals.totalSgst.toFixed(2)}</td>
              </tr>
              <tr className="grand">
                <td>Grand Total</td>
                <td className="gst-tval">₹ {totals.grandTotal.toFixed(2)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="gst-words">
          <strong>Total Amount in Words:</strong>
          <div className="gst-words-box">{numberToWordsINR(totals.grandTotal)}</div>
        </div>

        <div className="gst-bottom">
          <div>
            <h4>Payment Details</h4>
            <div className="line">UPI ID: {payment.upi || '—'}</div>
            <div className="line">Bank Name: {payment.bank || '—'}</div>
            <div className="line">A/C Name: {payment.acname || 'KHYATHI WEAVES'}</div>
            <div className="line">A/C No.: {payment.acno || '—'}</div>
            <div className="line">IFSC: {payment.ifsc || '—'}</div>
            <div className="line">Branch: {payment.branch || '—'}</div>
          </div>
          <div className="gst-signatory">
            <h4>For Khyathi Weaves</h4>
            <div className="sig-line">Authorised Signatory</div>
          </div>
          <div>
            <h4>Terms &amp; Conditions</h4>
            <div className="line">• Goods are subject to the applicable return/exchange policy.</div>
            <div className="line">• Please retain this invoice for your records.</div>
            <div className="line">• Warranty, if any, is as per manufacturer policy.</div>
            <div className="line">• Verify HSN and GST rate before issuing the invoice.</div>
            <div className="line">• Thank you for choosing Khyathi Weaves.</div>
          </div>
        </div>

        <div className="gst-footer">✦ THANK YOU FOR YOUR TRUST AND SUPPORT ✦</div>
      </div>

      {/* ── Editable form controls ── */}
      <div className="gst-form-section">
        <h3>Invoice Details</h3>
        <div className="gst-form-grid">
          <input type="text" placeholder="Invoice No. (e.g. KW-25-26/0001)" value={metaForm.invoiceNo} onChange={(e) => setMetaForm({ ...metaForm, invoiceNo: e.target.value })} />
          <input type="date" value={metaForm.invoiceDate} onChange={(e) => setMetaForm({ ...metaForm, invoiceDate: e.target.value })} />
          <input type="text" placeholder="Place of Supply (e.g. Kerala (32))" value={metaForm.placeOfSupply} onChange={(e) => setMetaForm({ ...metaForm, placeOfSupply: e.target.value })} />
          <select value={metaForm.reverseCharge} onChange={(e) => setMetaForm({ ...metaForm, reverseCharge: e.target.value })}>
            <option value="No">Reverse Charge: No</option>
            <option value="Yes">Reverse Charge: Yes</option>
          </select>
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={updateGstMeta}>
          Update
        </button>
      </div>

      <div className="gst-form-section">
        <h3>Seller Details (Bill From)</h3>
        <div className="gst-form-grid">
          <input type="text" placeholder="Business Name" value={sellerForm.name} onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })} />
          <input type="text" placeholder="Address" value={sellerForm.address} onChange={(e) => setSellerForm({ ...sellerForm, address: e.target.value })} />
          <input type="text" placeholder="GSTIN" value={sellerForm.gstin} onChange={(e) => setSellerForm({ ...sellerForm, gstin: e.target.value })} />
          <input type="text" placeholder="Email" value={sellerForm.email} onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={updateGstSeller}>
          Update
        </button>
      </div>

      <div className="gst-form-section">
        <h3>Buyer Details (Bill To)</h3>
        <div className="gst-form-grid">
          <input type="text" placeholder="Customer Name" value={buyerForm.name} onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })} />
          <input type="text" placeholder="Address" value={buyerForm.address} onChange={(e) => setBuyerForm({ ...buyerForm, address: e.target.value })} />
          <input type="text" placeholder="GSTIN (if any)" value={buyerForm.gstin} onChange={(e) => setBuyerForm({ ...buyerForm, gstin: e.target.value })} />
          <input type="text" placeholder="State" value={buyerForm.state} onChange={(e) => setBuyerForm({ ...buyerForm, state: e.target.value })} />
          <input type="text" placeholder="PIN" value={buyerForm.pin} onChange={(e) => setBuyerForm({ ...buyerForm, pin: e.target.value })} />
          <input type="text" placeholder="Phone" value={buyerForm.phone} onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })} />
          <input type="text" placeholder="Email" value={buyerForm.email} onChange={(e) => setBuyerForm({ ...buyerForm, email: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={updateGstBuyer}>
          Update
        </button>
      </div>

      <div className="gst-form-section">
        <h3>Add Item</h3>
        <div className="gst-form-grid">
          <input type="text" placeholder="Description of Goods" value={itemForm.desc} onChange={(e) => setItemForm({ ...itemForm, desc: e.target.value })} />
          <input type="text" placeholder="HSN/SAC" value={itemForm.hsn} onChange={(e) => setItemForm({ ...itemForm, hsn: e.target.value })} />
          <input type="number" placeholder="Qty" min="0" step="0.01" value={itemForm.qty} onChange={(e) => setItemForm({ ...itemForm, qty: e.target.value })} />
          <input type="text" placeholder="Unit (e.g. Nos)" value={itemForm.unit} onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })} />
          <input type="number" placeholder="Rate (₹)" min="0" step="0.01" value={itemForm.rate} onChange={(e) => setItemForm({ ...itemForm, rate: e.target.value })} />
          <input type="number" placeholder="Discount (₹)" min="0" step="0.01" value={itemForm.discount} onChange={(e) => setItemForm({ ...itemForm, discount: e.target.value })} />
          <input type="number" placeholder="GST %" min="0" step="0.01" value={itemForm.gstpct} onChange={(e) => setItemForm({ ...itemForm, gstpct: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={addGstItem}>
          <i className="fa-solid fa-plus"></i> Add Item
        </button>
      </div>

      <div className="gst-form-section">
        <h3>Payment Details</h3>
        <div className="gst-form-grid">
          <input type="text" placeholder="UPI ID" value={paymentForm.upi} onChange={(e) => setPaymentForm({ ...paymentForm, upi: e.target.value })} />
          <input type="text" placeholder="Bank Name" value={paymentForm.bank} onChange={(e) => setPaymentForm({ ...paymentForm, bank: e.target.value })} />
          <input type="text" placeholder="Account Name" value={paymentForm.acname} onChange={(e) => setPaymentForm({ ...paymentForm, acname: e.target.value })} />
          <input type="text" placeholder="Account Number" value={paymentForm.acno} onChange={(e) => setPaymentForm({ ...paymentForm, acno: e.target.value })} />
          <input type="text" placeholder="IFSC Code" value={paymentForm.ifsc} onChange={(e) => setPaymentForm({ ...paymentForm, ifsc: e.target.value })} />
          <input type="text" placeholder="Branch" value={paymentForm.branch} onChange={(e) => setPaymentForm({ ...paymentForm, branch: e.target.value })} />
        </div>
        <button className="btn btn-primary btn-sm" style={{ marginTop: 10 }} onClick={updateGstPayment}>
          Update
        </button>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={downloadGstPDF}>
          <i className="fa-solid fa-download"></i> Download PDF
        </button>
        <button className="btn btn-ghost" onClick={printGst}>
          <i className="fa-solid fa-print"></i> Print
        </button>
      </div>
    </div>
  )
}
