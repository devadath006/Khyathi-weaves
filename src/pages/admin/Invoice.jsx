import { useMemo, useState } from 'react'

export default function Invoice() {
  const [invoiceNo, setInvoiceNo] = useState('KW/2026/001')
  const [date, setDate] = useState('')
  const [paymentMode, setPaymentMode] = useState('Online / UPI')
  const [customerName, setCustomerName] = useState('Customer Name')
  const [complimentary, setComplimentary] = useState('')

  const [items, setItems] = useState([])
  const [desc, setDesc] = useState('')
  const [qty, setQty] = useState('')
  const [price, setPrice] = useState('')

  const dateDisplay = date ? new Date(date).toLocaleDateString('en-IN') : new Date().toLocaleDateString('en-IN')

  const grandTotal = useMemo(() => items.reduce((sum, it) => sum + it.qty * it.price, 0), [items])

  function addItem() {
    const q = parseFloat(qty) || 0
    const p = parseFloat(price) || 0
    if (!desc || q <= 0 || p <= 0) return
    setItems((prev) => [...prev, { desc, qty: q, price: p }])
    setDesc('')
    setQty('')
    setPrice('')
  }

  function downloadPDF() {
    if (!window.html2pdf) return
    window
      .html2pdf()
      .set({
        margin: 10,
        filename: 'Khyathi_Weaves_Invoice.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 1.5, useCORS: true, scrollX: 0, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(document.getElementById('kw-print-invoice'))
      .save()
  }

  function printInvoice() {
    document.body.classList.add('kw-printing-invoice')
    window.print()
    setTimeout(() => document.body.classList.remove('kw-printing-invoice'), 0)
  }

  return (
    <div className="invoice-wrap">
      <div id="kw-print-invoice" className="invoice-container">
        <div className="invoice-header">
          <img className="invoice-logo" src="/assets/logo.png" alt="Logo" />
          <div className="invoice-contact">
            www.khyathiweaves.in
            <br />
            +91 9446994852
          </div>
        </div>
        <div className="invoice-title">SALES INVOICE</div>
        <table className="invoice-table">
          <tbody>
            <tr>
              <td>
                <strong>Invoice No:</strong> {invoiceNo}
              </td>
              <td>
                <strong>Date:</strong> {dateDisplay}
              </td>
            </tr>
            <tr>
              <td>
                <strong>Payment Mode:</strong> {paymentMode}
              </td>
              <td>
                <strong>Customer:</strong> {customerName}
              </td>
            </tr>
          </tbody>
        </table>

        <table className="invoice-table" style={{ marginTop: 16 }}>
          <thead>
            <tr>
              <th>Description</th>
              <th>Qty</th>
              <th>Unit Price (₹)</th>
              <th>Total (₹)</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it, i) => (
              <tr key={i}>
                <td>{it.desc}</td>
                <td>{it.qty}</td>
                <td>{it.price.toFixed(2)}</td>
                <td>{(it.qty * it.price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-totals">
          <strong>Grand Total: ₹ {grandTotal.toFixed(2)}</strong>
        </div>

        {complimentary && <div className="invoice-complimentary">{complimentary}</div>}

        <div className="invoice-footer">
          "Grace in Every Thread – Tradition Woven for Generations."
          <br />
          "Crafted with Care. Worn with Pride."
        </div>
      </div>

      <div className="invoice-form-section">
        <h3>Invoice Details</h3>
        <div className="invoice-inputs">
          <input type="text" placeholder="Invoice Number" value={invoiceNo} onChange={(e) => setInvoiceNo(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input type="text" placeholder="Payment Mode" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)} />
          <input type="text" placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        </div>
      </div>

      <div className="invoice-form-section">
        <h3>Add Item</h3>
        <div className="invoice-inputs">
          <input type="text" placeholder="Description" value={desc} onChange={(e) => setDesc(e.target.value)} />
          <input type="number" placeholder="Qty" value={qty} onChange={(e) => setQty(e.target.value)} />
          <input type="number" placeholder="Unit Price ₹" value={price} onChange={(e) => setPrice(e.target.value)} />
          <button className="btn btn-primary" onClick={addItem}>Add</button>
        </div>

        <h3 style={{ marginTop: 16 }}>Complimentary Message</h3>
        <div className="invoice-inputs">
          <input
            type="text"
            placeholder="e.g. Thank you for shopping with us!"
            value={complimentary}
            onChange={(e) => setComplimentary(e.target.value)}
            style={{ flex: 1, minWidth: 240 }}
          />
        </div>
      </div>

      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
        <button className="btn btn-ghost" onClick={downloadPDF}>
          <i className="fa-solid fa-download"></i> Download PDF
        </button>
        <button className="btn btn-ghost" onClick={printInvoice}>
          <i className="fa-solid fa-print"></i> Print
        </button>
      </div>
    </div>
  )
}
