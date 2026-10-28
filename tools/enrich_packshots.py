#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Enrich Packshots Script:
Matches products against official Caudalie sitemap packshots, downloads them,
and refreshes TUM_STOK_ENVANTERI.md and database.
"""

import os
import re
import json
import requests
from PIL import Image
import io

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
APP_IMG_DIR = os.path.join(BASE_DIR, 'app', 'images')
SCRATCH_DIR = os.path.join(BASE_DIR, 'scratch')
DATA_DIR = os.path.join(BASE_DIR, 'app', 'data')

HEADERS = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}

def run_enrichment():
    import tools.build_master_inventory as master

    with open(os.path.join(SCRATCH_DIR, 'caudalie_official_packshots.json'), 'r', encoding='utf-8') as f:
        caudalie_packs = json.load(f)

    # Specific confirmed image URLs from caudalie_official_packshots
    url_overrides = {
        "IMG_20261028_102107.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_eau-de-raisin-200ml_packshot_caudalie-tr.jpg", # Grape water
        "IMG_20261028_102200.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinoclean_mousse_150ml_caudalie_packshot_offwhite.jpg", # Mousse 150ml
        "IMG_20261028_102250.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_packshot_huile_demaquillante_mini.jpg",
        "IMG_20261028_102529.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinoperfect_maks_pack_caudalie_2025.jpg",
        "IMG_20261028_102628.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinoclean_cre_me_gommante_caudalie_packshot_offwhite.jpg",
        "IMG_20261028_103051.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_rvl_serum_caudalie_packshot_230807.jpg",
        "IMG_20261028_103320.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/0/_/0_rvlift_fluid_packshot.jpg",
        "IMG_20261028_104312.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_premiercru_lacreme_caudalie_packshot.jpg",
        "IMG_20261028_104433.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_premiercru_serum_caudalie_packshot_456.jpg",
        "IMG_20261028_104513.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_serum_packshot_caudalie.jpg",
        "IMG_20261028_104542.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_cre_me_intense_pot_packshot_caudalie.jpg",
        "IMG_20261028_104615.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_gelee_packshot_caudalie-fr_1.jpg",
        "IMG_20261028_104926.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_moisturizing-oil-elixir_packshot_50ml_caudalie_fr_1.jpg",
        "IMG_20261028_105026.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinoclean_mask_75ml_pack_caudalie.jpg",
        "IMG_20261028_105102.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_beauty_elixir_edb_2_caudalie_packshot_offwhite_travel-size_1.jpg",
        "IMG_20261028_105216.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinopure_gele_e_75ml_caudalie_packshot_offwhite_travel-size.jpg",
        "IMG_20261028_105257.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinopure_lotion_400_packshot_caudalie.jpg",
        "IMG_20261028_105534.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinoperfect_hands_pack_caudalie.jpg",
        "IMG_20261028_105639.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_gd_edv_caudalie_packshot_offwhite.jpg",
        "IMG_20261028_110831.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_gel_e_packshot_caudalie.jpg",
        "IMG_20261028_110856.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_cre_me_intense_pot_packshot_caudalie.jpg",
        "IMG_20261028_110916.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_gelee_packshot_caudalie-fr_1.jpg",
        "IMG_20261028_110935.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_vinohydra_mask_pack_caudalie.jpg",
        "IMG_20261028_225654.jpg": "https://caudalie-europe.imgix.net/media/catalog/product/1/_/1_huile_de_soin_sdv_1_caudalie_packshot_offwhite.jpg"
    }

    # Apply overrides
    for item in master.RAW_INVENTORY_DEFINITIONS:
        fn = item['filename']
        if fn in url_overrides:
            item['direct_url'] = url_overrides[fn]

    print("Re-running download & report compilation...")
    master.download_packshots()
    master.generate_markdown_audit_report()
    master.update_products_database()
    print("Enrichment complete!")

if __name__ == '__main__':
    run_enrichment()
