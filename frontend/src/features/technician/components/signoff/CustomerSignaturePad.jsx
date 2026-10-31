import React, { useRef, useState, useEffect } from 'react';
import Card, { CardHeader } from '../../../../components/ui/Card';
import Button from '../../../../components/common/Button';
import { PenTool, RotateCcw, CheckCircle2, Star, ShieldCheck } from 'lucide-react';

export const CustomerSignaturePad = ({ customerName = '', onSaveSignoff, isSubmitting }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [clientName, setClientName] = useState(customerName || '');
  const [rating, setRating] = useState(5);
  const [remarks, setRemarks] = useState('Installation completed satisfactorily. Generation verified on bi-directional net meter.');
  const [signedProof, setSignedProof] = useState(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.lineWidth = 2.5;
      ctx.lineCap = 'round';
      ctx.strokeStyle = '#0F172A';
    }
  }, []);

  const startDrawing = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches?.[0]?.clientX) - rect.left;
    const y = (e.clientY || e.touches?.[0]?.clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleConfirmSignoff = async () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob(async (blob) => {
      const formData = new FormData();
      formData.append('customer_name', clientName || customerName);
      formData.append('feedback_rating', String(rating));
      formData.append('feedback_remarks', remarks);
      if (blob) {
        formData.append('signature_file', blob, 'customer_signoff.png');
      }

      if (onSaveSignoff) {
        await onSaveSignoff(formData);
        setSignedProof(canvas.toDataURL('image/png'));
      }
    }, 'image/png');
  };

  return (
    <Card padding={false} className="overflow-hidden mb-6">
      <CardHeader
        title="Customer Handover & Digital Signature Acknowledgement"
        subtitle="Capture authorized customer sign-off on site to acknowledge generation meter verification and workmanship"
        icon={PenTool}
      />

      <div className="p-5 space-y-6">
        {signedProof ? (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
            <div className="flex items-center gap-2 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Customer Sign-Off Successfully Recorded!</span>
            </div>
            <p className="text-xs text-emerald-800">
              Acknowledged by <strong>{clientName}</strong> with {rating}-star rating on{' '}
              {new Date().toLocaleDateString()}.
            </p>
            <div className="bg-white p-3 rounded-lg border border-emerald-200 inline-block">
              <img src={signedProof} alt="Captured signature" className="h-16 object-contain" />
            </div>
          </div>
        ) : (
          <>
            {/* Customer Name & Rating */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Signatory Name *
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Enter full name of customer"
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Satisfaction Rating
                </label>
                <div className="flex items-center gap-2 h-10 px-3 bg-slate-50 rounded-lg border border-slate-200">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition"
                    >
                      <Star
                        className={`w-4 h-4 ${
                          star <= rating
                            ? 'text-amber-400 fill-amber-400'
                            : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating} / 5 Stars</span>
                </div>
              </div>
            </div>

            {/* Customer Remarks */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Remarks / Handover Feedback
              </label>
              <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>

            {/* Signature Canvas Area */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-700">
                  Digital Signature Pad (Draw with Touch / Mouse) *
                </label>
                <Button
                  size="xs"
                  variant="ghost"
                  icon={RotateCcw}
                  onClick={clearCanvas}
                  className="text-slate-500 hover:text-rose-600"
                >
                  Clear Pad
                </Button>
              </div>

              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50/50 overflow-hidden touch-none">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={180}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full h-44 cursor-crosshair bg-white"
                />
                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-400 text-xs font-medium">
                    Please sign here inside this box with finger or mouse stylus
                  </div>
                )}
              </div>
            </div>

            {/* Confirmation & Submit */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Legally binding digital proof of installation acceptance
              </span>

              <Button
                variant="primary"
                onClick={handleConfirmSignoff}
                disabled={!hasSignature || !clientName}
                isLoading={isSubmitting}
              >
                Capture Customer Sign-Off
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};

export default CustomerSignaturePad;

