#!/usr/bin/env python3
"""
Code Validation Test Suite for Express Banners
Validates code structure, implementations, and mappings without requiring Cloudinary connection.
"""

import re
import json
from pathlib import Path

class CodeValidationTest:
    def __init__(self):
        self.test_results = []
        self.project_root = Path("/app")
    
    def log_test(self, test_name: str, passed: bool, details: str = ""):
        """Log test result"""
        status = "✅ PASS" if passed else "❌ FAIL"
        print(f"{status} - {test_name}")
        if details:
            print(f"   Details: {details}")
        
        self.test_results.append({
            "test": test_name,
            "passed": passed,
            "details": details
        })
    
    def test_cloudinary_uses_resources_by_asset_folder(self):
        """Verify listByFolder function uses resources_by_asset_folder (Dynamic Folder Mode)"""
        cloudinary_file = self.project_root / "server/lib/cloudinary.js"
        content = cloudinary_file.read_text()
        
        # Check for resources_by_asset_folder usage
        has_resources_by_asset_folder = "cloudinary.api.resources_by_asset_folder" in content
        
        # Check that it's used in listByFolder function
        listByFolder_match = re.search(r'const listByFolder = async.*?^};', content, re.MULTILINE | re.DOTALL)
        uses_in_function = False
        if listByFolder_match:
            function_body = listByFolder_match.group(0)
            uses_in_function = "resources_by_asset_folder" in function_body
        
        success = has_resources_by_asset_folder and uses_in_function
        self.log_test(
            "listByFolder uses cloudinary.api.resources_by_asset_folder (Dynamic Folder Mode)",
            success,
            f"Found resources_by_asset_folder: {has_resources_by_asset_folder}, Used in listByFolder: {uses_in_function}"
        )
        return success
    
    def test_cloudinary_has_prefix_fallback(self):
        """Verify listByFolder has fallback to prefix-based listing"""
        cloudinary_file = self.project_root / "server/lib/cloudinary.js"
        content = cloudinary_file.read_text()
        
        # Look for fallback mechanism
        has_catch_block = "catch (firstError)" in content
        has_prefix_fallback = "cloudinary.api.resources" in content and "prefix" in content
        
        # Check for specific fallback pattern
        fallback_pattern = r'catch.*?prefix.*?cloudinary\.api\.resources'
        has_fallback_pattern = bool(re.search(fallback_pattern, content, re.DOTALL))
        
        success = has_catch_block and has_prefix_fallback and has_fallback_pattern
        self.log_test(
            "listByFolder has fallback to prefix-based listing",
            success,
            f"Catch block: {has_catch_block}, Prefix API: {has_prefix_fallback}, Fallback pattern: {has_fallback_pattern}"
        )
        return success
    
    def test_cloudinary_recursive_subfolders(self):
        """Verify listByFolder recursively checks subfolders using sub_folders API"""
        cloudinary_file = self.project_root / "server/lib/cloudinary.js"
        content = cloudinary_file.read_text()
        
        # Check for sub_folders API usage
        has_sub_folders_api = "cloudinary.api.sub_folders" in content
        
        # Check for recursive processing
        has_recursive_logic = "getSubfolders" in content and "for (const sub of subs)" in content
        
        # Check for deep subfolder processing
        has_deep_processing = "deepSubs" in content or "Go one level deeper" in content
        
        success = has_sub_folders_api and has_recursive_logic and has_deep_processing
        self.log_test(
            "listByFolder recursively checks subfolders using sub_folders API",
            success,
            f"sub_folders API: {has_sub_folders_api}, Recursive logic: {has_recursive_logic}, Deep processing: {has_deep_processing}"
        )
        return success
    
    def test_media_route_content_type(self):
        """Verify /media route returns JSON Content-Type, not HTML"""
        server_file = self.project_root / "server.js"
        content = server_file.read_text()
        
        # Find the /media route handler
        media_route_pattern = r'app\.get\("/media".*?\}\);'
        media_route_match = re.search(media_route_pattern, content, re.MULTILINE | re.DOTALL)
        
        has_json_content_type = False
        if media_route_match:
            route_body = media_route_match.group(0)
            has_json_content_type = 'res.set("Content-Type", "application/json")' in route_body
        
        success = has_json_content_type
        self.log_test(
            "/media route returns JSON Content-Type, not HTML",
            success,
            f"Found JSON Content-Type header in /media route: {has_json_content_type}"
        )
        return success
    
    def test_media_debug_endpoint_exists(self):
        """Verify /media/debug endpoint exists in server.js"""
        server_file = self.project_root / "server.js"
        content = server_file.read_text()
        
        has_debug_route = 'app.get("/media/debug"' in content
        has_cloudinary_info = "hasCloudName" in content and "hasApiKey" in content
        
        success = has_debug_route and has_cloudinary_info
        self.log_test(
            "/media/debug endpoint exists in server.js",
            success,
            f"Debug route found: {has_debug_route}, Cloudinary info check: {has_cloudinary_info}"
        )
        return success
    
    def test_media_folders_endpoint_exists(self):
        """Verify /media/folders endpoint exists in server.js"""
        server_file = self.project_root / "server.js"
        content = server_file.read_text()
        
        has_folders_route = 'app.get("/media/folders"' in content
        uses_sub_folders_api = "cloudinary.api.sub_folders" in content
        
        success = has_folders_route and uses_sub_folders_api
        self.log_test(
            "/media/folders endpoint exists in server.js",
            success,
            f"Folders route found: {has_folders_route}, Uses sub_folders API: {uses_sub_folders_api}"
        )
        return success
    
    def test_services_folder_map_correct(self):
        """Verify SERVICES_FOLDER_MAP has correct mappings"""
        server_file = self.project_root / "server.js"
        content = server_file.read_text()
        
        # Extract SERVICES_FOLDER_MAP
        services_map_pattern = r'const SERVICES_FOLDER_MAP = \{(.*?)\};'
        services_map_match = re.search(services_map_pattern, content, re.DOTALL)
        
        required_services = {
            "Signs": "expressbanners/SignsandBanners",
            "Banners": "expressbanners/SignsandBanners", 
            "Embroidery": "expressbanners/Embroidery",
            "Screen Printing": "expressbanners/Promotional Printing",
            "Graphic Designing": "expressbanners/catalogue"
        }
        
        all_mappings_correct = False
        if services_map_match:
            map_content = services_map_match.group(1)
            all_mappings_correct = all(
                f'"{service}": "{folder}"' in map_content
                for service, folder in required_services.items()
            )
        
        success = all_mappings_correct
        self.log_test(
            "SERVICES_FOLDER_MAP has correct mappings for all services",
            success,
            f"All required service mappings found: {all_mappings_correct}"
        )
        return success
    
    def test_gallery_uses_list_by_folder(self):
        """Verify /api/gallery uses listByFolder with CATALOGUE_FOLDER"""
        server_file = self.project_root / "server.js"
        content = server_file.read_text()
        
        # Check CATALOGUE_FOLDER definition
        has_catalogue_folder = 'CATALOGUE_FOLDER = "expressbanners/catalogue"' in content
        
        # Check /api/gallery route uses listByFolder
        gallery_route_pattern = r'app\.get\("/api/gallery".*?\}\);'
        gallery_route_match = re.search(gallery_route_pattern, content, re.MULTILINE | re.DOTALL)
        
        uses_list_by_folder = False
        if gallery_route_match:
            route_body = gallery_route_match.group(0)
            uses_list_by_folder = "listByFolder(CATALOGUE_FOLDER" in route_body
        
        success = has_catalogue_folder and uses_list_by_folder
        self.log_test(
            "/api/gallery uses listByFolder with CATALOGUE_FOLDER",
            success,
            f"CATALOGUE_FOLDER defined: {has_catalogue_folder}, Uses listByFolder: {uses_list_by_folder}"
        )
        return success
    
    def test_routes_before_spa_fallback(self):
        """Verify all routes are BEFORE the * SPA fallback"""
        server_file = self.project_root / "server.js"
        content = server_file.read_text()
        
        # Find SPA fallback route
        spa_fallback_pattern = r'app\.get\("\*"'
        spa_fallback_match = re.search(spa_fallback_pattern, content)
        
        if not spa_fallback_match:
            self.log_test(
                "All routes before * SPA fallback",
                False,
                "SPA fallback route not found"
            )
            return False
        
        spa_fallback_pos = spa_fallback_match.start()
        
        # Check that all required routes come before SPA fallback
        routes_to_check = [
            "/media/debug",
            "/media/folders", 
            "/media",
            "/api/gallery",
            "/api/services-media"
        ]
        
        all_routes_before = True
        for route in routes_to_check:
            route_pattern = f'app.get("{route}"'
            route_match = re.search(route_pattern, content)
            if route_match:
                route_pos = route_match.start()
                if route_pos >= spa_fallback_pos:
                    all_routes_before = False
                    break
            else:
                all_routes_before = False
                break
        
        success = all_routes_before
        self.log_test(
            "All routes (/media/debug, /media/folders, /media, /api/gallery, /api/services-media) are BEFORE * SPA fallback",
            success,
            f"All routes positioned before SPA fallback: {all_routes_before}"
        )
        return success
    
    def test_frontend_folder_map_matches_backend(self):
        """Verify frontend FOLDER_MAP matches backend SERVICES_FOLDER_MAP"""
        # Read frontend app.js
        frontend_file = self.project_root / "js/app.js"
        frontend_content = frontend_file.read_text()
        
        # Read backend server.js
        backend_file = self.project_root / "server.js"
        backend_content = backend_file.read_text()
        
        # Extract frontend FOLDER_MAP
        frontend_map_pattern = r'const FOLDER_MAP = \{(.*?)\};'
        frontend_map_match = re.search(frontend_map_pattern, frontend_content, re.DOTALL)
        
        # Extract backend SERVICES_FOLDER_MAP
        backend_map_pattern = r'const SERVICES_FOLDER_MAP = \{(.*?)\};'
        backend_map_match = re.search(backend_map_pattern, backend_content, re.DOTALL)
        
        maps_match = False
        if frontend_map_match and backend_map_match:
            # Check that all backend services have matching frontend entries
            frontend_map_content = frontend_map_match.group(1)
            backend_map_content = backend_map_match.group(1)
            
            # Extract service mappings from backend
            service_mappings = {}
            service_pattern = r'"([^"]+)":\s*"([^"]+)"'
            for match in re.finditer(service_pattern, backend_map_content):
                service, folder = match.groups()
                service_mappings[service] = folder
            
            # Check if frontend has matching entries
            maps_match = all(
                f'{service}: "{folder}"' in frontend_map_content
                for service, folder in service_mappings.items()
            )
        
        success = maps_match
        self.log_test(
            "Frontend FOLDER_MAP matches backend SERVICES_FOLDER_MAP",
            success,
            f"Frontend and backend service mappings match: {maps_match}"
        )
        return success
    
    def test_frontend_functions_exist(self):
        """Verify frontend js/app.js has required functions"""
        frontend_file = self.project_root / "js/app.js"
        content = frontend_file.read_text()
        
        required_functions = ["fetchMedia", "loadCloudinaryMedia", "loadServiceMedia"]
        
        functions_found = {}
        for func in required_functions:
            functions_found[func] = f"const {func} =" in content or f"function {func}" in content
        
        all_functions_exist = all(functions_found.values())
        
        success = all_functions_exist
        self.log_test(
            "Frontend fetchMedia, loadCloudinaryMedia, loadServiceMedia functions exist",
            success,
            f"Functions found: {functions_found}"
        )
        return success
    
    def run_all_tests(self):
        """Run all code validation tests"""
        print("🔍 Running Express Banners Code Validation Tests")
        print("=" * 55)
        
        tests = [
            self.test_cloudinary_uses_resources_by_asset_folder,
            self.test_cloudinary_has_prefix_fallback,
            self.test_cloudinary_recursive_subfolders,
            self.test_media_route_content_type,
            self.test_media_debug_endpoint_exists,
            self.test_media_folders_endpoint_exists,
            self.test_services_folder_map_correct,
            self.test_gallery_uses_list_by_folder,
            self.test_routes_before_spa_fallback,
            self.test_frontend_folder_map_matches_backend,
            self.test_frontend_functions_exist
        ]
        
        passed_count = 0
        for test in tests:
            if test():
                passed_count += 1
        
        print("\n" + "=" * 55)
        print(f"📊 Code Validation Results: {passed_count}/{len(tests)} tests passed")
        
        success_rate = (passed_count / len(tests)) * 100
        
        summary = {
            "total_tests": len(tests),
            "passed_tests": passed_count,
            "failed_tests": len(tests) - passed_count,
            "success_rate": f"{success_rate:.1f}%",
            "results": self.test_results
        }
        
        if passed_count == len(tests):
            print("🎉 All code validation tests passed!")
        else:
            print(f"⚠️  {len(tests) - passed_count} tests failed")
        
        return summary

def main():
    """Run the code validation test suite"""
    tester = CodeValidationTest()
    results = tester.run_all_tests()
    
    # Return appropriate exit code
    return 0 if results["failed_tests"] == 0 else 1

if __name__ == "__main__":
    exit(main())