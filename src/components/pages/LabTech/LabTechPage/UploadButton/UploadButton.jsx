import { useState } from 'react';
import { ethers } from 'ethers';
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
import { enforceSepolia } from '@/utils/enforceSepolia.js';

const getReadableBlockchainError = (error) => {
    const message =
        error?.reason ||
        error?.shortMessage ||
        error?.message ||
        error?.info?.error?.message ||
        error?.error?.message ||
        'Lỗi không xác định';

    if (/Unauthorized/i.test(message)) {
        return 'Ví MetaMask hiện tại chưa có quyền LAB_TECH trên blockchain';
    }

    if (/InvalidState/i.test(message)) {
        return 'Hồ sơ bệnh án không ở trạng thái hợp lệ để cập nhật kết quả xét nghiệm';
    }

    if (/insufficient funds/i.test(message)) {
        return 'Ví MetaMask không đủ SepoliaETH để trả phí gas';
    }

    if (/user rejected|rejected the request|denied|cancelled/i.test(message)) {
        return 'Bạn đã từ chối thao tác trên MetaMask';
    }

    return message;
};

const emptyForm = {
    pregnancies: '',
    glucose: '',
    bloodPressure: '',
    skinThickness: '',
    insulin: '',
    bmi: '',
    diabetesPedigreeFunction: '',
    age: '',
    note: '',
};

export default function UploadButton({ medicalRecordId }) {
    const [form, setForm] = useState(emptyForm);
    const [open, setOpen] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (key, value) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        setError('');
    };

    const resetForm = () => {
        setForm(emptyForm);
        setError('');
    };

    const validateForm = () => {
        const { glucose, bloodPressure, skinThickness, insulin, bmi, age } = form;

        if (!glucose || !bloodPressure || !skinThickness || !insulin || !bmi || !age) {
            return 'Vui lòng nhập đầy đủ các chỉ số bắt buộc';
        }

        if (
            Number(glucose) <= 0 ||
            Number(bloodPressure) <= 0 ||
            Number(skinThickness) <= 0 ||
            Number(insulin) <= 0 ||
            Number(bmi) <= 0 ||
            Number(age) <= 0
        ) {
            return 'Các giá trị phải lớn hơn 0';
        }

        if (Number(bmi) > 100) {
            return 'BMI không hợp lệ';
        }

        return null;
    };

    const parseResponse = async (res) => {
        let body = null;

        try {
            body = await res.json();
        } catch (e) {
            body = null;
        }

        const data = body?.data || body;

        if (!res.ok) {
            throw new Error(data?.message || body?.message || 'Có lỗi xảy ra');
        }

        return data;
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
                pregnancies: Number(form.pregnancies || 0),
                glucose: Number(form.glucose),
                bloodPressure: Number(form.bloodPressure),
                skinThickness: Number(form.skinThickness),
                insulin: Number(form.insulin),
                bmi: Number(form.bmi),
                diabetesPedigreeFunction: Number(form.diabetesPedigreeFunction || 0),
                age: Number(form.age),
                note: form.note,
            },
        };

        const loadingToast = toast.loading('Đang lưu kết quả xét nghiệm và gọi AI...');
        setLoading(true);
        setError('');

        try {
            const createRes = await fetch(`${BE_URL}/lab-techs/medical-records/${medicalRecordId}/test-results`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(payload),
            });

            const createdData = await parseResponse(createRes);

            const testResultId = createdData?.testResultId;
            const resultHash = createdData?.resultHash;
            const blockchain = createdData?.blockchain;
            const contractAddress = blockchain?.contractAddress;
            const method = blockchain?.method;
            const args = Array.isArray(blockchain?.args) ? blockchain.args : [];

            if (!testResultId || !resultHash || !contractAddress || method !== 'appendTestResult' || args.length < 2) {
                throw new Error(
                    createdData?.message || 'Backend chưa trả đủ metadata blockchain để ký appendTestResult',
                );
            }

            if (!window.ethereum) {
                throw new Error('Cần cài MetaMask để ký giao dịch blockchain');
            }

            await enforceSepolia();
            await window.ethereum.request({ method: 'eth_requestAccounts' });

            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();

            const contract = new ethers.Contract(
                contractAddress,
                ['function appendTestResult(string mongoId, bytes32 _resultHash) external'],
                signer,
            );

            toast.loading('Đang kiểm tra điều kiện blockchain...', { id: loadingToast });
            await contract.appendTestResult.staticCall(args[0], args[1]);

            toast.loading('Đang gọi MetaMask để niêm phong kết quả...', { id: loadingToast });
            const tx = await contract.appendTestResult(args[0], args[1]);

            toast.loading('Đang chờ blockchain xác nhận...', { id: loadingToast });
            const receipt = await tx.wait();
            const txHash = receipt?.hash || tx.hash;

            toast.loading('Đang xác minh giao dịch với backend...', { id: loadingToast });
            const verifyRes = await fetch(`${BE_URL}/lab-techs/test-results/${testResultId}/verify-tx`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ txHash }),
            });

            await parseResponse(verifyRes);

            resetForm();
            setOpen(false);

            toast.success('Lưu kết quả, ký blockchain và xác minh thành công', {
                id: loadingToast,
            });
        } catch (err) {
            const message = getReadableBlockchainError(err);
            setError(message);
            toast.error(message, { id: loadingToast });
        } finally {
            setLoading(false);
        }
    };

    const isDisabled =
        form.glucose === '' ||
        form.bloodPressure === '' ||
        form.skinThickness === '' ||
        form.insulin === '' ||
        form.bmi === '' ||
        form.age === '' ||
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

                    <Input label="Tuổi" value={form.age} onChange={(v) => handleChange('age', v)} />
                </div>

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

                <div className="mt-4">
                    <label className="text-sm font-medium">Ghi chú</label>
                    <textarea
                        className="w-full mt-1 p-2 border rounded-lg"
                        rows={3}
                        value={form.note}
                        onChange={(e) => handleChange('note', e.target.value)}
                    />
                </div>

                <DialogFooter className="mt-6">
                    <DialogClose>
                        <button
                            className="px-4 py-2 border-2 rounded-lg cursor-pointer shadow-xs transition-all duration-300 hover:shadow-sm hover:scale-[1.01] font-semibold"
                            onClick={resetForm}
                        >
                            Hủy
                        </button>
                    </DialogClose>

                    <button
                        type="button"
                        disabled={isDisabled}
                        className={`${
                            isDisabled
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-primary text-white hover:shadow-sm hover:scale-[1.01] cursor-pointer'
                        } px-4 py-2 rounded-lg shadow-xs transition-all duration-300 font-semibold`}
                        onClick={handleSubmit}
                    >
                        {loading ? 'Đang xử lý...' : 'Lưu & Phân tích'}
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
