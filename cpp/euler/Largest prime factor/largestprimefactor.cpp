#include <iostream>
#include <vector>
#include <math.h>
#include <cmath>
#include <cstdio>
using std::vector;

void integratedSievedFactorization(uint64_t);
bool isPrime(uint32_t);

int main (){
    using namespace std;
    uint64_t original;
    cin >> original;
    integratedSievedFactorization(original);
    return 0;
}


void integratedSievedFactorization(uint64_t n){
    bool trigger = false;
    uint64_t keep = n;
    printf("Factoring %llu...\n",n);
    for (uint64_t p = 2; p < keep;p++){    //count to n, checking if prime on each number.
        if (isPrime(p)) {
            while (n%p==0){
                printf("%u is prime.Factoring...\n",p); //prime factorization
                printf("%u/%d=%d\n",n,p,n/p);
                n = n / p;
                if (n==1) {break;}
            }
        }
    }
}

bool isPrime(uint32_t cp){
    /*
    function is_prime(n)
    if n ≤ 1
        return false
    else if n ≤ 3
        return true
    else if n mod 2 = 0 or n mod 3 = 0
        return false
    let i ← 5
    while i * i ≤ n
        if n mod i = 0 or n mod (i + 2) = 0
            return false
        i ← i + 6
    return true
    */

    if (cp <= 3) {return true;}
    else if (cp%2==0 || cp%3==0) {return false;}
    int i = 5;
    while (i*i<=cp){
            if (cp%i==0 || cp%(i+2)==0) {return false;}
            i += 6;
    }
    return true;
}
