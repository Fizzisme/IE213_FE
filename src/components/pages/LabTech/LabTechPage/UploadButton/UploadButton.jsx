import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogClose,
} from '@/components/animate-ui/components/radix/dialog';

import { Upload } from '@/components/animate-ui/icons/upload.js';
import { BE_URL } from '@/lib/constans.js';
import { toast } from 'sonner';

export default function UploadButton({ medicalRecordId }) {
    const [form, setForm] = useState({
        pregnancies: '',
        glucose: '',
        bloodPressure: '',
        skinThickness: '',
        insulin: '',
        bmi: '',
        diabetesPedigreeFunction: '',
        note: '',
    });
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setForm({ ...form, [key]: value });
        setError('');
    };
    const validateForm = () => {
        const { glucose, bloodPressure, skinThickness, insulin, bmi } = form;

        if (!glucose || !bloodPressure || !skinThickness || !insulin || !bmi) {
            return 'Vui lòng nhập đầy đủ các chỉ số';
        }

        if (Number(glucose) <= 0 || Number(bloodPressure) <= 0 || Number(bmi) <= 0) {
            return 'Giá trị phải lớn hơn 0';
        }

        if (Number(bmi) > 100) {
            return 'BMI không hợp lệ';
        }

        return null;
    };

    const handleSubmit = async () => {
        const errMsg = validateForm();

        if (errMsg) {
            setError(errMsg);
            return;
        }
        const payload = {
            testType: 'DIABETES_TEST',
            rawData: {
                pregnancies: Number(form.pregnancies),
                diabetesPedigreeFunction: Number(form.diabetesPedigreeFunction),
                glucose: Number(form.glucose),
                bloodPressure: Number(form.bloodPressure),
                skinThickness: Number(form.skinThickness),
                insulin: Number(form.insulin),
                bmi: Number(form.bmi),
                note: form.note,
            },
        };

        toast.promise(
            async () => {
                setLoading(true);

                try {
                    const res = await fetch(`/api/v1/lab-techs/medical-records/${medicalRecordId}/test-results`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload),
                    });

                    const data = await res.json().then((r) => r.data);

                    if (!res.ok) {
                        throw new Error(data.message || 'Có lỗi xảy ra');
                    }

                    const createdAt = new Date(data?.createdAt).toLocaleDateString('vi-VN', {
                        timeZone: 'Asia/Ho_Chi_Minh',
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                    });

                    setForm({
                        diabetesPedigreeFunction: '',
                        pregnancies: '',
                        glucose: '',
                        bloodPressure: '',
                        skinThickness: '',
                        insulin: '',
                        bmi: '',
                        note: '',
                    });

                    return { data, createdAt };
                } finally {
                    setLoading(false);
                }
            },
            {
                loading: 'Đang gửi kết quả xét nghiệm...',
                success: ({ data, createdAt }) => {
                    setOpen(false);
                    return {
                        message: data?.message || 'Kết quả đã được lưu',
                        description: <p className="text-xs text-textColor">{createdAt}</p>,
                    };
                },
                error: (err) => ({
                    message: <p className="text-red-400">{err?.message || 'Có lỗi xảy ra'}</p>,
                }),
            },
        );
    };

    const isDisabled =
        form.glucose === '' ||
        form.bloodPressure === '' ||
        form.skinThickness === '' ||
        form.insulin === '' ||
        form.bmi === '' ||
        loading;

    const isObese = Number(form.bmi) > 30;
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger className="h-fit p-1.5 border-2 rounded-lg cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01]">
                <Upload animateOnHover className="h-4 w-4" />
            </DialogTrigger>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Kết quả xét nghiệm</DialogTitle>
                </DialogHeader>

                {/* FORM */}
                <div className="grid grid-cols-2 gap-4 mt-4">
                    <Input
                        label="Số lần mang thai"
                        value={form.pregnancies}
                        onChange={(v) => handleChange('pregnancies', v)}
                    />

                    <Input
                        label="Chỉ số di truyền tiểu đường"
                        value={form.diabetesPedigreeFunction}
                        onChange={(v) => handleChange('diabetesPedigreeFunction', v)}
                    />

                    <Input label="Glucose" value={form.glucose} onChange={(v) => handleChange('glucose', v)} />

                    <Input
                        label="Blood Pressure"
                        value={form.bloodPressure}
                        onChange={(v) => handleChange('bloodPressure', v)}
                    />

                    <Input
                        label="Skin Thickness"
                        value={form.skinThickness}
                        onChange={(v) => handleChange('skinThickness', v)}
                    />

                    <Input label="Insulin" value={form.insulin} onChange={(v) => handleChange('insulin', v)} />

                    <Input label="BMI" value={form.bmi} onChange={(v) => handleChange('bmi', v)} />
                </div>

                {/* BMI STATUS */}
                {form.bmi && (
                    <div
                        className={`mt-4 p-3 rounded-lg ${
                            isObese ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                        }`}
                    >
                        BMI Status: {isObese ? 'Béo phì' : 'Bình thường'}
                    </div>
                )}
                {error && <div className="mt-3 p-3 bg-red-100 text-red-600 rounded-lg text-sm">{error}</div>}
                {/* NOTE */}
                <div className="mt-4">
                    <label className="text-sm font-medium">Ghi chú</label>
                    <textarea
                        className="w-full mt-1 p-2 border rounded-lg"
                        rows={3}
                        value={form.note}
                        onChange={(e) => handleChange('note', e.target.value)}
                    />
                </div>

                {/* FOOTER */}
                <DialogFooter className="mt-6">
                    <DialogClose>
                        <button
                            className="px-4 py-2 border-2 rounded-lg cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01] font-semibold"
                            onClick={() => {
                                setForm({
                                    diabetesPedigreeFunction: '',
                                    pregnancies: '',
                                    glucose: '',
                                    bloodPressure: '',
                                    skinThickness: '',
                                    insulin: '',
                                    bmi: '',
                                    note: '',
                                });
                                setError('');
                            }}
                        >
                            Hủy
                        </button>
                    </DialogClose>

                    <button
                        type={'button'}
                        disabled={isDisabled}
                        className={`${
                            isDisabled
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-primary text-white hover:shadow-sm hover:scale-[1.01] cursor-pointer'
                        } 
                                px-4 py-2 rounded-lg shadow-xs transition-all duration-300 font-semibold`}
                        onClick={handleSubmit}
                    >
                        Lưu & Phân tích
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
function Input({ label, value, onChange }) {
    return (
        <div>
            <label className="text-sm font-medium">{label}</label>
            <input
                type="number"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full mt-1 p-2 border rounded-lg"
            />
        </div>
    );
}
