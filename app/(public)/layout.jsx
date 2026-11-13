'use client'
import Banner from "@/components/Banner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setProduct } from "@/lib/features/product/productSlice";
import { setAddressList } from "@/lib/features/address/addressSlice";

export default function PublicLayout({ children }) {

    const dispatch = useDispatch();

    useEffect(() => {
        const syncData = async () => {
            try {
                const [prodRes, addrRes] = await Promise.all([
                    fetch('/api/products'),
                    fetch('/api/addresses?userId=user_customer')
                ]);
                const prodData = await prodRes.json();
                const addrData = await addrRes.json();

                if (prodData.success && prodData.products?.length > 0) {
                    dispatch(setProduct(prodData.products));
                }
                if (addrData.success && addrData.addresses?.length > 0) {
                    dispatch(setAddressList(addrData.addresses));
                }
            } catch (err) {
                // Silently fallback to initial state
            }
        };

        syncData();
    }, [dispatch]);

    return (
        <>
            <Banner />
            <Navbar />
            {children}
            <Footer />
        </>
    );
}
